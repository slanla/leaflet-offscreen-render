
docker build -t test image
if [ $? -ne 0 ]; then
  echo "build error"
  exit 1
fi
docker run \
  -it --rm \
    -v $PWD:/output \
    test
