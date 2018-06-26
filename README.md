# AWS Serverless

```
 Lambda를 이용한 서버리스 구현
```


## 람다를 사용하기 위한 준비절차

1. AWS계정
2. 람다를 실행할 롤(Role)

```
Role이란 사용자와 비슷한 개념이고 자신이 작성할 람다 함수를 실행 해 줄 누군가를 뜻한다
즉 그 누군가 (시스템) 의 권한 을 모아서 정책화 한것이다.
```

![](/images/role.png)


## Hello World

```
AWS콘솔을 이용해서 간단한 예제를 작성할 수 있다.
```

![](/images/helloworld.png)

테스트를 실행하고 로그를 보도록 하자 
로그를 보려면 로그를 생성한 권한이 람다 실행 롤에 포함되어야 한다.


## 람다 패키징

 AWS CLI를 이용한 람다 배포

현재 프로그램을 zip로 패키징한다.

```bash
aws lambda create-function 
 --region ap-northeast-2 
 --function-name Thumbnailer 
 --zip-file fileb://./thumbnailer.zip 
 --role 'arn:aws:iam::[your account]:role/[role name]' 
 --handler Thumbnailer.handler 
 --runtime python3.6 
 --timeout 10 
 --memory-size 1024
```

패키징 작업이 만만치 않다 그래서 툴을 사용하는데  
여기서는 serverless 를 사용하겠다.


## Thumbnail Service


### 1. 템플릿 생성

```bash
sls create --template aws-nodejs --path thumbnail-lambda
cd thumbnail-lambda
npm init -y
npm install --save gm aws-sdk

```

### 2. 썸네일 생성 로직

전제조건) S3 버킷에 파일이 있다.  
1. 클라이이언트 측에서 정해진 사이즈로 파일을 불러온다.  
2. 이미지 사이즈는 고정값이 아니고 그때그때 마다 지정한다.  
아래와 같이 이미지를 요청하면  
```
http://xxxxx/resized/100x100/abc.png
```
S3 resized/100x100 버킷에 이미지 없을 경우 생성한다.  
이미지 생성 후 혹은 2.의 요청에서 이미지가 있을 경우 리다이텍트한다.
