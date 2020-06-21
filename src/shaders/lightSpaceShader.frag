#version 330 core
layout (location=0) out vec3 normal;
layout (location=1) out vec3 worldPos;
layout (location=2) out vec3 flux;

in vec3 FS_normal;
in vec3 FS_position;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};
uniform Material material;

struct Light {
	vec3 position;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;

	float constant;
	float linear;
	float quadratic;
};
uniform Light light;

void main()
{
	normal=FS_normal;
	worldPos=FS_position;

	vec3 lightDir = normalize(light.position - FS_position);
	vec3 norm=normalize(FS_normal);
	float diff=max(0.0, dot(norm, lightDir));

	flux=diff*material.diffuse*light.diffuse;
}