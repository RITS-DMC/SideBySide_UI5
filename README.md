1. Clone the project from the provided Git repository.

        Install Dependencies & Start the Application
		
        Navigate to the project directory in your terminal and run the following commands:

             npm install
             npm run-script start

2. After executing the above commands, you'll see a URL like http://localhost:8080 in the terminal.

        Press Ctrl + Click on the URL to open it in your browser.
        
		On the landing page, click on index.html to launch the application.

        Note:

            Deployment to Docker and the Kyma environment is currently skipped for this setup.

3. Create HANA Database Table

        Create the following table in your SAP HANA database:

            CREATE COLUMN TABLE "DBADMIN"."Z_USERGROUP" (
                    "USERID" NVARCHAR(200) NOT NULL,
                    "DESCRIPTION" NVARCHAR(200) NOT NULL,
                    "PERSONALID" NVARCHAR(300) NOT NULL,
                    PRIMARY KEY ("USERID")
                );
				
4. Set Up Custom Node.js API

        To perform CRUD operations, create a custom Node.js backend to connect with your HANA DB and handle the operations.

        Update API Endpoints

        Replace the sample API endpoints in the UI with your actual backend endpoints:

                    Operation	     Sample Endpoint	  Replace With
					
                    Insert/Update	/api/v1/user/add	/api/insert/userDetails
					
                    Read	        /api/v1/users	    /api/get/userDetails
					
                    Delete	       /api/v1/user/delete/	/api/delete/userDetails

5. Reference Folder

        Check the CustomNodeJSAPIs folder in the project root for example implementations of these API endpoints.




## Overview

This sample provides a frontend SAPUI5 application that you can configure with any of the sample `Order` APIs.

This sample demonstrates how to:

- Create a development Namespace in the Kyma runtime.
- Configure and build an SAPUI5 Docker image.
- Deploy the frontend in the Kyma runtime which includes:
  - A ConfigMap that contains the URL to the backend API.
  - A Deployment of the frontend image with the ConfigMap mounted to a volume.
  - A Service to expose the UI to other Kubernetes resources.
  - An API to expose the frontend externally.

## Prerequisites

- SAP BTP, Kyma runtime instance
- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/en/)
- [UI5 Tooling](https://sap.github.io/ui5-tooling/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) configured to use the `KUBECONFIG` file downloaded from the Kyma runtime.

## Steps

### Run the frontend locally

1. Clone the project.

2. Inside the directory, run:

 ```
 npm install
 ```

3. Adjust the value of the **API_URL** parameter in the `webapp/config.js` file to match your `orders` API URL.

4. To start the application, run:

 ```
 npm run-script start
 ```

 The application loads at `http://localhost:8080`.

### Build the Docker image

1. Build and push the image to your Docker repository:

  ```
  docker build -t {your-docker-account}/fe-ui5-mssql -f docker/Dockerfile .
  docker push {your-docker-account}/fe-ui5-mssql
  ```

2. To run the image locally, adjust the value of the **API_URL** parameter in the `webapp/config.js` file and mount it into the image:

  ```
  docker run --mount type=bind,source=$(pwd)/webapp/config.json,target=/usr/share/nginx/html/config.json -p 8080:80 -d {your-docker-account}/fe-ui5-mssql:latest
  ```

### Deploy the frontend

1. Create a new `dev` Namespace:

  ```shell script
  kubectl create namespace dev
  ```

2. Within the project open the file `k8s/configmap.yaml` and adjust the `API_URL` by replacing `<cluster domain>` to the match the Kyma runtime cluster domain.

3. Apply the Resources:

  ```shell script
  kubectl -n dev apply -f ./k8s/configmap.yaml
  kubectl -n dev apply -f ./k8s/deployment.yaml
  kubectl -n dev apply -f ./k8s/apirule.yaml
  ```

4. Use the APIRule to open the application:
  ```
  https://fe-ui5-mssql.{cluster-domain}
  ```
