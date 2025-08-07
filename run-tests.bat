@echo off
echo ========================================
echo RUNNING UNIT TESTS AND INTEGRATION TESTS
echo ========================================

echo.
echo 1. Running Unit Tests...
mvn test -Dtest=ResponsableDepartementServiceTest

echo.
echo 2. Running Controller Tests...
mvn test -Dtest=ResponsableDepartementControllerTest

echo.
echo 3. Running Integration Tests...
mvn test -Dtest=ResponsableDepartementIntegrationTest

echo.
echo 4. Running All Tests...
mvn test

echo.
echo ========================================
echo TESTS COMPLETED
echo ========================================
echo.
echo Test reports available in: target/surefire-reports/
echo.
pause 