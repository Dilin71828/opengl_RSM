#version 330 core
layout (location=0) in vec3 position;
layout (location=1) in vec3 normal;

out vec3 FS_normal;
out vec3 FS_position;

uniform mat4 lightSpaceMatrix;
uniform mat4 model;

void main()
{
	FS_normal=mat3(transpose(inverse(model)))*normal;
	vec4 worldPos=model*vec4(position, 1.0);
	FS_position=worldPos.xyz;
	gl_Position=lightSpaceMatrix*model*vec4(position, 1.0f);
}