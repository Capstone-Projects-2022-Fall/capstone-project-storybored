### Docker setup

- Build the two images for backend / front AFTER making any updates the backend / front
- ```docker build -t storybored-frontend:0.1 .```  --> run INSIDE storybored-frontend folder
- ```docker build -t storybored-backend:0.1 .```   --> run INSIDE storybored-backend folder

- If you need to run the containers individually  (add -d to run in backend)
- ```docker run -p 3000:3000 --name storybored-frontend storybored-frontend:0.1```
- ```docker run -p 7007:7007 --name storybored-backend storybored-backend:0.1```
- ```docker run -p 6379:6379 --name redis redis:alpine```

- To run all at once:
- Run ```docker-compose up``` in storybored-app folder 
