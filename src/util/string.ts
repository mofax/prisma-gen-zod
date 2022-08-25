export function lowerFirstChar(str: string) {
	return str.charAt(0).toLowerCase() + str.slice(1)
}

export function toCamelCase(str: string, startUpper = false) {
	const camel = str.replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
	return startUpper ? camel[0].toUpperCase() + camel.slice(1) : camel
}
