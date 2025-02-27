#!/bin/bash

ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
ECR_ENDPOINT="${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
ECR_REPO=pcluster-manager

pushd frontend
docker build -t frontend .
popd
docker build -t ${ECR_REPO} .

#docker tag pcluster-manager ${ECR_ENDPOINT}/${ECR_REPO}:latest
#docker push ${ECR_ENDPOINT}/${ECR_REPO}:latest

aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/n0x0o5k1
docker tag pcluster-manager:latest public.ecr.aws/n0x0o5k1/pcluster-manager:latest
docker push public.ecr.aws/n0x0o5k1/pcluster-manager:latest
