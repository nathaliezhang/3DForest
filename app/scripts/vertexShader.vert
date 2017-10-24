attribute vec3 color;
varying vec4 vColor;
void main() {
    gl_Position = vec4(position, 1) ;
    vColor = vec4(color, 1.0);
}
