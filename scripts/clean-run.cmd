@echo off
REM Regénère le classpath Maven (springdoc aligné) puis lance l'app — à utiliser si /v3/api-docs renvoie 500.
cd /d "%~dp0.."
call mvnw.cmd clean spring-boot:run
