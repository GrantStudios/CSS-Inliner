const htmlPlaceholder = '<html>\n\n<head></head>\n\n<body>\n  <p>Your HTML code...</p>\n</body>\n  \n</html>';
const cssPlaceholder = '/* your css code */\n\np{\n    color: red; \n}'

const container = document.querySelector('.container')
const navbar = document.querySelector('.navbar')

const windowHeight = window.innerHeight;

container.style.height = windowHeight - navbar.offsetHeight + 'px';

const HTMLparser = new DOMParser();

var htmlMixedEditor = CodeMirror.fromTextArea(htmleditor, {
    mode: "htmlmixed",
    lineNumbers: true,
    lineWrapping: true,
    theme: "dracula"
});

var cssEditor = CodeMirror.fromTextArea(csseditor, {
    mode: "css",
    lineNumbers: true,
    lineWrapping: true,
    theme: "dracula"
});

var result = CodeMirror.fromTextArea(resulteditor, {
    mode: "htmlmixed",
    lineNumbers: true,
    lineWrapping: true,
    theme: "dracula",
    readOnly: true
});

htmlMixedEditor.on('change', changeListener)
cssEditor.on('change', changeListener)


var changes = 0;

htmlMixedEditor.getDoc().setValue(htmlPlaceholder)
cssEditor.getDoc().setValue(cssPlaceholder)

function changeListener() {
    changes++
    try {
        const html = htmlMixedEditor.getValue()
        const css = cssEditor.getValue()
        const parsed = cssparser.parse(css)
        if (parsed) {
            const parsedJSON = parsed.toJSON('simple');
            const parsedHTML = HTMLparser.parseFromString(html, 'text/html');
            window.e = parsedHTML;
            window.y = parsedJSON
            parsedJSON.value.forEach(e => {
                if (e.type == 'rule') {
                    const keys = Object.keys(e.declarations);
                    e.selectors.forEach(selector => {
                        parsedHTML.querySelectorAll(selector).forEach(element => {
                            keys.forEach(prop => element.style[prop] = e.declarations[prop]);
                        })
                    })
                } else if (e.type == '@import') {
                    let matches = e.value.match(/'|"/g);
                    let firstQuoteIndex = e.value.indexOf(matches[0])
                    let lastQuoteIndex = e.value.lastIndexOf(matches[matches.length - 1]);
                    const url = e.value.substring(firstQuoteIndex + 1, lastQuoteIndex);
                    var linkElement = document.createElement('link')
                    linkElement.href = url;
                    linkElement.rel = "stylesheet";
                    parsedHTML.head.appendChild(linkElement);
                }
            })

            result.getDoc().setValue(html_beautify(parsedHTML.documentElement.outerHTML))
        }
    } catch (e) {
        result.getDoc().setValue('...')
    }
}

function copy(e) { var n = document.createElement("textarea"); n.innerHTML = e, document.body.appendChild(n), n.select(); var o = document.execCommand("copy"); return document.body.removeChild(n), o }

const resultCopyButton = document.getElementById('result-copy');
resultCopyButton.addEventListener('click', function () {
    copy(result.getValue());
})

window.onbeforeunload = function () {
    if (changes > 2) {
        return "";
    } else {
        return void (0);
    }
}