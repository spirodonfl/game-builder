KEYBOARD.initialize();
KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f4'], function () {
    window.location = 'index.html';
});
KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f5'], function () {
    window.location.reload();
});