#version 330 core
in vec3 Normal;
in vec3 FragPos;
in vec4 FragPosLightSpace;

out vec4 FragColor;

uniform sampler2D depthMap;
uniform sampler2D normalMap;
uniform sampler2D worldPosMap;
uniform sampler2D fluxMap;
uniform sampler2D randomMap;

uniform float shadow_bias;
uniform int sample_num;
uniform float sample_radius;
uniform vec3 viewPos;

uniform float near_plane;
uniform float far_plane;

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

float LinerizeDepth(float depth)
{
	float z=depth*2.0-1.0;
	return (2.0*near_plane*far_plane)/(far_plane + near_plane - z * (far_plane - near_plane));
}

void main(){
    //计算光源空间坐标
	vec3 projCoords=FragPosLightSpace.xyz/FragPosLightSpace.w;
	projCoords=projCoords*0.5+0.5;

	//计算阴影
	float depthValue=LinerizeDepth(texture(depthMap, projCoords.xy).r);
	float shadow=LinerizeDepth(projCoords.z)-shadow_bias>depthValue?0.05:1.0;

	//计算间接光照
	vec3 indirect=vec3(0.0,0.0,0.0);
	for (int i=0; i<sample_num; i=i+1){
		vec3 r=texelFetch(randomMap, ivec2(i, 0), 0).xyz;
		vec2 sample_coord=projCoords.xy+r.xy*sample_radius;
		float weight=r.z;

		vec3 target_normal=normalize(texture(normalMap, sample_coord).xyz);
		vec3 target_worldPos=texture(worldPosMap, sample_coord).xyz;
		vec3 target_flux=texture(fluxMap, sample_coord).rgb;

		vec3 indirect_result=target_flux*max(0, dot(target_normal, FragPos-target_worldPos))*max(0, dot(Normal, target_worldPos-FragPos))/pow(length(FragPos-target_worldPos),4.0);
		indirect_result*=weight;
		indirect+=indirect_result;
	}
	indirect=clamp(indirect/sample_num, 0.0, 1.0);



	vec3 lightDir = normalize(light.position - FragPos);
	//vec3 lightDir=normalize(-light.direction);

	//环境光
	vec3 ambient = light.ambient * material.ambient;
	
	//漫反射
	vec3 norm = normalize(Normal);
	float diff=max(dot(norm,lightDir),0.0);  
	vec3 diffuse = light.diffuse * diff * material.diffuse;

	//镜面反射
	vec3 viewDir=normalize(viewPos-FragPos);
	//vec3 reflectDir=reflect(-lightDir, norm);
	vec3 halfwayDir=normalize(lightDir+viewDir);
	float spec = pow(max(dot(norm, halfwayDir), 0.0), material.shininess);
	vec3 specular=light.specular * spec * material.specular;


	//衰减
	//float dist=length(light.position-FragPos);
	//float attenuation=1.0/(light.constant+light.linear*dist+light.quadratic*dist*dist);
	//ambient*=attenuation;
	//diffuse*=attenuation;
	//specular*=attenuation;
	
	//vec3 result=ambient+diffuse+specular;
	//vec3 result=indirect*20;
	//vec3 result=ambient+(diffuse+specular)*shadow;
	vec3 result=ambient + (diffuse + specular)*shadow + indirect*20;
	//vec3 result=specular;

	float gamma = 2.2;
	FragColor=vec4(result,1.0);
	FragColor.rgb = pow(FragColor.rgb, vec3(1.0/gamma));
}