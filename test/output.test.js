import { Schema } from '../index';

const SCHEMATRON_EXAMPLE = `<schema xmlns="http://purl.oclc.org/dsdl/schematron">
	<pattern>
		<rule context="thunder[@foo]">
			<report test="true()">A report that always fires <name /> for any foo</report>
			<report test="false()" id="fires-never">A report that never fires <name /> for any foo</report>
			<assert test="not(@foo = 'bar' and not(preceding-sibling::*))" id="foobar-1st-child">An assert that fails once out of three times</assert>
		</rule>
		<rule context="thunder">
			<assert test="@foo = 'bar'" id="fires-always">An assert that applies to only one element and always fails</assert>
		</rule>
	</pattern>
</schema>`.replace(/\t|\n/g, '');

const DOCUMENT_EXAMPLE = `<xml foo="err">
	<thunder />
	<thunder foo="unbar">
		<thunder foo="bar" />
	</thunder>
	<thunder foo="bar" />
</xml>`.replace(/\t|\n/g, '')

describe('Output', () => {
	it('Schema.fromString(SCHEMATRON_EXAMPLE)', () => {
		expect(Schema.fromString(SCHEMATRON_EXAMPLE)).toMatchSnapshot();
	});

	it('schema.validateString(DOCUMENT_EXAMPLE)', () => {
		expect(Schema.fromString(SCHEMATRON_EXAMPLE).validateString(DOCUMENT_EXAMPLE)).toMatchSnapshot();
	});
});
