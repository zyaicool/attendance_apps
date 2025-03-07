default user to login:
{
    "username":"admin",
    "password":"tesbaru123"
}

command cek container run on docker
- node service : docker exec -it attendance_services bash 
- redis : redis-cli ping
- elasticsearch : curl http://localhost:9200
- mysql : -h 127.0.0.1 -u user -p


docker command:
- build image : docker-compose up
- check all container : docker ps -a
- check log : docker logs <container_id>
- rebuild : docker rm -f <container_id>
- restart : docker restart <container_id>
- remove all container : docker rm -f $(docker ps -aq)
- Remove Everything : docker system prune -a --volumes -f


Install docker on wsl (windows only):
1. open powershell
2. run wsl --install
3. set username and password for login to wsl
4. run command sudo apt update to get all update
5. run command sudo apt install -y docker.io to install docker on wsl
6. run command sudo apt install -y docker.io docker-compose
7. run command npm install

how to run this services:
1. make sure docker is install on device or using docker in wsl (for windows only)
2. for docker on wsl do this command cd /mnt/d/{services_directory_on_windows}, if not using windows maybe can move to no 3
3. run docker-compose up to run all config

how to create database manual if its not automatic create when all docker run:
1. run command docker exec -it attendance_mysql_server mysql -u root -p
2. insert password = root
3. run command CREATE DATABASE attendance_apps;
4. run command show databases; to check databases was created