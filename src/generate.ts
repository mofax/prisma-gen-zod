import { DMMF, EnvValue } from "@prisma/generator-helper"
import { Project, SourceFile } from "ts-morph"
import * as path from "node:path"
import { lowerFirstChar } from "./util/string"

function generateKnownTypes(
	sourceFile: SourceFile,
	_enums: DMMF.DatamodelEnum[],
	models: DMMF.Model[]
) {
	const knownModels = models.map((value) => {
		return `"${lowerFirstChar(value.name)}"`
	})

	sourceFile.addStatements(`export type KnownClientModels = ${knownModels.join(" | ")};`)
}

function generateEnums(sourceFile: SourceFile, enums: DMMF.DatamodelEnum[]) {
	enums.forEach((enum_) => {
		const enumName = enum_.name
		const enumValues = enum_.values.map((value) => {
			return `"${value.name}"`
		})

		const enumList = enumValues.join(", ")

		sourceFile.addStatements(
			`export const ${lowerFirstChar(enumName)} = z.enum([${enumList}]);`
		)
	})
}

function generateModels(sourceFile: SourceFile, models: DMMF.Model[]) {
	function appendModifiers(source: string[], isList: boolean, isRequired: boolean = true) {
		let values = []
		if (isList) {
			values.push("array()")
		}
		if (!isRequired) {
			values.push("optional()")
		}
		return [...source, ...values]
	}
	function generateZodType(field: DMMF.Field) {
		const kind = field.kind
		const type = field.type
		const isList = field.isList
		const isRequired = field.isRequired

		if (kind === "scalar") {
			let zodStatement = []
			switch (type) {
				case "String": {
					zodStatement.push("z.string()")
					break
				}
				case "Int": {
					zodStatement.push("z.number()")
					break
				}
				case "DateTime": {
					zodStatement.push("z.date()")
					break
				}
				case "Boolean": {
					zodStatement.push("z.boolean()")
					break
				}
				case "Json": {
					zodStatement.push("z.object({})")
					break
				}
				default: {
					zodStatement.push("z.unknown()")
					break
				}
			}
			return appendModifiers(zodStatement, isList, isRequired).join(".")
		}

		if (kind === "enum") {
			return appendModifiers([lowerFirstChar(field.type)], isList, isRequired).join(".")
		}

		if (kind === "object") {
			return appendModifiers(["z.object({})"], isList, false).join(".")
		}

		return "z.unknown()"
	}

	models.forEach((model) => {
		const modelName = model.name

		const modelFields = model.fields.map((field) => {
			const fieldName = field.name
			return `${fieldName}: ${generateZodType(field)}`
		})

		const modelList = modelFields.join(", ")

		sourceFile.addStatements(
			`export const ${lowerFirstChar(modelName)} = z.object({ ${modelList} }).strict();`
		)
	})
}

type GeneratorParams = [
	{
		output: EnvValue | null
	},
	DMMF.DatamodelEnum[],
	DMMF.Model[]
]
export async function generate(...params: GeneratorParams) {
	const [options, enums, models] = params
	const project = new Project()
	const outPutDir = options.output?.value || path.join(process.cwd(), "/zod-generated")
	const sourceFile = project.createSourceFile(path.join(outPutDir, "index.ts"), "", {
		overwrite: true,
	})

	sourceFile.addImportDeclaration({
		moduleSpecifier: "zod",
		namedImports: ["z"],
	})

	// add known types
	generateKnownTypes(sourceFile, enums, models)

	// add enums
	generateEnums(sourceFile, enums)

	// add models
	generateModels(sourceFile, models)

	sourceFile.saveSync()
}
