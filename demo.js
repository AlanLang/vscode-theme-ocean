/**
 * An exceptionally useful comment
 * @param {string} param description
 * @return {Object} returned description
 */
function func(param) {
    var text = 'string';
    for (var i = 0; i < param.length; i++) {
        text += i;
        console.log('%ctext: ','color: MidnightBlue; background: Aquamarine;',text);
    }
    return {
        text: text,
        "boolean": false
    }
}
