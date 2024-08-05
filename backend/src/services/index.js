const url = new URL("http://192.168.6.94:9000/devicepool/218482e96cc81c26b130b64160c427db?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=F7Guy2oCQE1PYLO0jE9R%2F20240801%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240801T025723Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=a21647059652c7862b42d4d21b813c067a68583d0c132b4e77f729b7f7a7529c")


console.log(url.origin+url.pathname)