---
title: Creating AWS Resources with Localstack and Docker Compose
description: Using AWS-CLI and docker-compose depends_on conditions to prepare the system for a server
date: 2023-03-07 16:48:23
tags:
  - posts
  - aws
  - docker
  - localstack
  - kotlin
---

To test AWS resources locally, you can simulate then in Docker with the `localstack/localstack` image.

When spawning a server (which I call my "app" from now on), like a java/kotlin backend which polls AWS SQS and publishes to AWS SNS,
you want the SQS queue and SNS topic to exist before `java -jar` executes.

## Setting Up docker-compose.yml

You can create the AWS resources by creating another one-off Docker container with the AWS CLI.
To make sure your app does not start before the AWS CLI has created the resources,
we alter `docker-compose.yml`'s `depends_on` to include a condition.
The condition states that `localstack` must have started, and that our AWS CLI `create-resources` task exited successfully.
Only then, will the java `app` start up.

Our app also reads properties to tweak its AWS Java SDK Clients, redirecting their
AWS Endpoint to new URL.

> Note that we use `localstack` (not `localhost`) inside docker-compose.
> The region is `us-east-1`, unless you tell localstack to use a different region.
> The AWS credentials must be set, but their value can be anything.

It looks like this:
```yaml
version: "3.8"

services:
  # This uses my app.jar Java server
  app:
    image: my-java-service:latest
    ports:
      - "8080:8080" # http://localhost:8080/health
    links:
      - localstack:localstack
    environment:
      # Make sure your code reads the environment variables and tweaks its AWS SDK.
      # This process is not automatic.
      - aws.localstack.enabled=true
      - aws.region=us-east-1
      - aws.localstack.sqs.endpointOverride=http://localstack:4566
      - aws.localstack.sns.endpointOverride=http://localstack:4566
      - myQueue.sqs.url=http://localstack:4566/000000000000/my-cool-queue
      - myTopic.sns.arn=arn:aws:sns:us-east-1:000000000000:my-cool-topic
    depends_on:
      # The conditions are important!
      localstack:
        condition: service_healthy
      create-resources:
        condition: service_completed_successfully
  
  localstack:
    container_name: localstack_main
    image: localstack/localstack:1.4.0
    ports:
      - "127.0.0.1:4566:4566"            # LocalStack Gateway
      - "127.0.0.1:4510-4559:4510-4559"  # external services port range
    environment:
      - DOCKER_HOST=unix:///var/run/docker.sock
      - DEBUG=0
    volumes:
      - "./volume:/var/lib/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
  
  # Our one-off task with AWS-CLI
  create-resources:
    restart: "no"
    image: amazon/aws-cli:2.11.0
    depends_on:
      localstack:
        condition: service_healthy
    environment:
      - AWS_DEFAULT_REGION=us-east-1
      - AWS_ACCESS_KEY_ID=x
      - AWS_SECRET_ACCESS_KEY=x
    entrypoint: [ "sh", "-c" ]
    command: [ "aws --endpoint-url=http://localstack:4566 sns create-topic --name my-cool-topic &&
     aws --endpoint-url=http://localstack:4566 sqs create-queue --queue-name my-cool-queue" ]

```

> The localstack service in `docker-compose.yml` was copied from https://github.com/localstack/localstack/blob/master/docker-compose.yml and slightly trimmed down.


> **Tip:** You can do this with a database too: 
> ```yaml
> app:
>   depends_on:
>     db:
>       condition: service_started
> ```

## Inside the Server

The kotlin code that creates the SQS client looks like this:
```kotlin
private fun createSqsClient(config: Config): SqsClient =
    SqsClient.builder()
        .region(config.awsConfig.sqsRegion)
        .apply {
          if (config.awsConfig.awsUseLocalstack) {
            this.endpointOverride(URI(config.awsConfig.sqsEndpointOverride!!))
            this.credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create("x", "x"),
                ),
            )
          }
        }
        .build()
```

and its config:

```kotlin
data class AwsConfig(
    val myQueueUrl: String,
    val myTopicArn: String,
    val awsUseLocalstack: Boolean,
    val snsEndpointOverride: String?,
    val sqsEndpointOverride: String?,
    val sqsRegion: Region = Region.US_EAST_1,
    val snsRegion: Region = Region.US_EAST_1,
)
```