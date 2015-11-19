/// <reference path="jquery.d.ts" />
/// <reference path="FormatterSettings.ts" />


module Utils {

	/**
	 * Takes a string of xml and returns is as a structured html list of lists.
	 */
    export class XmlFormatter {


		/// Tracks current level of nesting in the original xml.
        private currentIndent:number;

		/// Option, the maximum level of nesting before the formatter applies a class to indicate the html should be
		/// be collapsed.
        private maxIndent:number;

		// Option, the maximum length of an attribute before it is hidden with an ellipsis.
		private maxAttributeLength:number;

		// Option, a list of names of elements which are collapsed by default.
		private elementsToCollapse:string[] = [];

        constructor(settings:FormatterSettings) {

            this.currentIndent = 0;

			// Load settings.
			this.maxAttributeLength = settings.maxAttributeLength || 9999;
			this.maxIndent = settings.maxIndent || 9999;
			var names:string[] = settings.elementsToCollapse ? settings.elementsToCollapse.split(' ') : [''];
			$.each(names, (index:number, elem:string) => {
				this.elementsToCollapse.push(elem.trim());
			});
        }


		/**
		 * Formats a single line of xml, this is either a complete element, if at the bottom level, or the opening or
		 * closing tag.
		 * @param line {string} string of xml to be formatted.
		 * @param levelChange {number} 1 if level of nesting has increased, -1 if it has decreased, otherwise 0
		 * @returns {string} html list element with correct formatting.
		 */
        private formatLine(line:string, levelChange:number):string {
			var elementName:string = line.match(/[<\/]*([^ <>\/]*)/)[1];

            // Format attributes.
            line = line.replace(/(\w+)="([^"]*)"/g, (match, attributeName, attributeValue) => {
                var out = ' |{|span class="sh2"|}|' + attributeName + '|{|/span class="sh2"|}|'
                    + '|{|span class="sh3"|}|=|{|/span class="sh3"|}|'
                    + '"';

				// Trim long attribute values.
                if (attributeValue.length < this.maxAttributeLength) {
                    out += '|{|span class="sh3"|}|' + attributeValue + '|{|/span class="sh3"|}|' + '"';
                } else {
                    out += '|{|span class="xmlDisplay-overflowing-attribute" data-overflow="' + attributeValue + '"|}|'
                        + '...'
                        + '|{|/span class="sh2"|}|' + '"';
                }
                return out;
            });

            // Format element names.
			// sh1 = element names
			// sh2 = attribute names
			// sh3 = opening and closing tags and element values.
            line = line.replace(/<([^ ]*)\/>/g, '|{|span class="sh3"|}|&lt;|{|/span|}|'				// <elem/>
                + '|{|span class="sh1"|}|$1|{|/span|}|'
                + '|{|span class="sh3"|}|/&gt;|{|/span|}|');
			line = line.replace(/<([^> ]*)>|<(\/[^> ]*)>/g, '|{|span class="sh3"|}|&lt;|{|/span|}|' // <elem> or </elem>
			+ '|{|span class="sh1"|}|$1|{|/span|}|'
			+ '|{|span class="sh3"|}|&gt;|{|/span|}|');
			line = line.replace(/<([^ ]*)/g, '|{|span class="sh3"|}|&lt;|{|/span|}|'				// <elem
                + '|{|span class="sh1"|}|$1|{|/span|}|');
            line = line.replace(/\/>/g, '|{|span class="sh3"|}|/&gt;|{|/span|}|');					// />

            // Catch any remaining angle brackets.
            line = line.replace(/>/g, '|{|span class="sh3"|}|&gt;|{|/span|}|');

			// Convert placeholder brackets to actual brackets.
            line = line.replace(/\|{\|/g, '<');
            line = line.replace(/\|}\|/g, '>');

            if (levelChange > 0) {

				if ($.inArray(elementName, this.elementsToCollapse) > -1
					|| this.currentIndent >= this.maxIndent) {
                    return '<li class="closed">' + line + '</li>';
                }
                //this.currentIndent += levelChange;
            }
            return '<li>' + line + '</li>';

        }


        private indent():string {
            this.currentIndent += 1;
            return '<ul>';
        }

        private unindent():string {
            this.currentIndent -= 1;
            return '</ul>';
        }


		/**
		 * Runs the formatter, takes a string of xml and returns formatted html.
		 * @param data {string} xml to be transformed.
		 * @returns {string} formatted html.
		 */
        public getFormattedXml(data):string {
            var output:string = '',
                i:number,
                input:string[];

            // Split elements.
            input = data.split(/(?=<)/gm);	// Can have '<elem>text' this will be corrected below.

            // Construct formatted xml.
            for (i = 0; i < input.length; i += 1) {
                if (input[0][input[0].length - 1] !== '>') {
                    //<elem>text --> <elem>text</elem>
                    output += this.formatLine(input[i] + input[i + 1], 0);
                    i += 1;
                } else if (/\/>/.test(input[i])) {
                    // <elem />
                    output += this.formatLine(input[i], 0);
                } else if (i !== input.length && /<[^\/]*>/.test(input[i]) && /<\//.test(input[i + 1])) {
                    //<elem></elem>
                    output += this.formatLine(input[i] + input[i + 1], 0);
                    i += 1;
                } else if (/<\//.test(input[i])) {
                    //</elem>
                    output += this.unindent();
                    output += this.formatLine(input[i], -1);
                } else {
                    //<elem>
                    output += this.formatLine(input[i], 1);
                    output += this.indent();
                }
            }
            output = '<ul>' + output + '</ul>';
            return output;
        }


    }


}