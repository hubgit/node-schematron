import { evaluateXPathToString, evaluateXPathToBoolean, Node } from 'fontoxpath';
import Result from './Result';

function namespaceResolver(input) {
	console.log('Assert namespaceResolver', input);
	return input;
}

export default class Assert {
	test: string;
	message: Array<string | Object>;
	isReport: boolean;

	constructor(test, message, isReport) {
		this.test = test;
		this.message = message;
		this.isReport = isReport;
	}

	createMessageString(contextNode: Node, variables: Object, chunks: Array<string | any>): string {
		return chunks
			.map((chunk): string => {
				if (typeof chunk === 'string') {
					return chunk;
				}

				// <sch:name />
				if (chunk.$type === 'name') {
					return evaluateXPathToString(
						'name(' + (chunk.path || '') + ')',
						contextNode,
						null,
						variables,
						{
							namespaceResolver
						}
					);
				}

				// <sch:value-of />
				if (chunk.$type === 'value-of') {
					return evaluateXPathToString(chunk.select, contextNode, null, variables, {
						namespaceResolver
					});
				}

				console.log(chunk);
				throw new Error('Unsupported element in <sch:message>');
			})
			.join('');
	}

	validateNode(context: Node, variables: Object): Result | null {
		const outcome = evaluateXPathToBoolean(this.test, context, null, variables, {
			namespaceResolver
		});
		return (!this.isReport && outcome) || (this.isReport && !outcome)
			? null
			: new Result(context, this, this.createMessageString(context, variables, this.message));
	}

	static QUERY = `map {
		'test': @test/string(),
		'message': array { (./text()|./element())/local:json(.) },
		'isReport': boolean(local-name() = 'report')
	}`;

	static fromJson(json): Assert {
		return new Assert(json.test, json.message, json.isReport);
	}
}
