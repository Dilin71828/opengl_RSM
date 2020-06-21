#version 330 core
layout (location=0) in vec3 aPos;
layout (location=1) in vec3 aNormal;

out vec3 Normal;
out vec3 FragPos;
out vec4 FragPosLightSpace;


uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 lightSpaceMatrix;

void main()
{
	gl_Position=projection*view*model*vec4(aPos, 1.0f);
	Normal=mat3(transpose(inverse(model)))*aNormal;
	FragPos=vec3(model*vec4(aPos,1.0));
	FragPosLightSpace=lightSpaceMatrix*vec4(FragPos, 1.0);
}