#version 330 core
out vec4 FragColor;

in vec2 FS_texcoord;

uniform sampler2D depthMap;
uniform sampler2D normalMap;
uniform sampler2D worldPosMap;
uniform sampler2D fluxMap;

uniform float near_plane;
uniform float far_plane;

float LinerizeDepth(float depth)
{
	float z=depth*2.0-1.0;
	return (2.0*near_plane*far_plane)/(far_plane + near_plane - z * (far_plane - near_plane));
}

void main()
{
	float depthValue=texture(depthMap, FS_texcoord).r;
	vec3 depthColor=vec3(LinerizeDepth(depthValue))/far_plane;
	vec3 normalColor=texture(normalMap, FS_texcoord).rgb;
	vec3 worldPosColor=normalize(texture(worldPosMap, FS_texcoord).rgb);
	vec3 fluxColor=normalize(texture(fluxMap, FS_texcoord).rgb);

	FragColor=vec4(fluxColor, 1.0);

	if (FragColor.x<0)
	{
		FragColor.x=-FragColor.x;
	}
}