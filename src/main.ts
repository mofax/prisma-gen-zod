import { generatorHandler } from "@prisma/generator-helper"
import { generate } from "./generate"

generatorHandler({
	onGenerate: async (options) => {
		const config = options.generator
		const dmmf = options.dmmf
		const { enums, models } = dmmf.datamodel
		generate(
			{
				output: config.output,
			},
			enums,
			models
		)
	},
})
