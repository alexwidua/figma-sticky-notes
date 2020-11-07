import { hexToGl, randomCoord } from './helpers/utils';

figma.showUI(__html__);
figma.ui.resize(300, 300);

function handleError() {
  figma.notify('Oops, could not load fonts. Plugin cancelled.');
  figma.closePlugin();
}

figma
  .listAvailableFontsAsync()
  .then(() => {
    return figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
  })
  .catch(() => handleError());

// Plugin main
figma.ui.onmessage = async msg => {
  if (msg.type === 'create-note') {
    const nodes = [];
    const width = 200;
    const height = 200;
    const shadowWidth = 170;
    const shadowHeight = 30;
    const padding = 32;

    // Create sticky note shadow
    const shadow = figma.createEllipse();
    shadow.name = 'Shadow';
    shadow.resizeWithoutConstraints(shadowWidth, shadowHeight);
    shadow.x = (width - shadowWidth) / 2;
    shadow.y = height - shadowHeight;
    shadow.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    shadow.effects = [{ type: 'LAYER_BLUR', radius: 20, visible: true }];
    nodes.push(shadow);

    // Create actual sticky note
    const note = figma.createRectangle();
    note.name = 'Note';
    note.resizeWithoutConstraints(width, height);
    note.fills = [
      {
        type: 'SOLID',
        color: hexToGl(msg.background)
      }
    ];
    note.effects = [
      {
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        blendMode: 'NORMAL',
        offset: { x: 0, y: 5 },
        radius: 5,
        visible: true
      }
    ];
    nodes.push(note);

    // Create sticky note content
    const text = figma.createText();
    note.name = 'Content';
    text.resizeWithoutConstraints(width - padding, height - padding);
    text.x = padding / 2;
    text.y = padding / 2;
    text.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    text.fontName = { family: 'Roboto', style: 'Regular' };
    text.fontSize = msg.fontSize;
    text.textAlignHorizontal = 'CENTER';
    text.textAlignVertical = 'CENTER';

    if (msg.content) {
      text.characters = msg.content;
    } else {
      text.characters = 'Text';
    }

    nodes.push(text);

    // Group nodes together
    const stickyNote = figma.group(nodes, figma.currentPage);
    stickyNote.name = 'Sticky Note';

    // Position sticky notes in center of viewport + add a small random spread
    stickyNote.x = figma.viewport.center.x - width / 2 + randomCoord(100);
    stickyNote.y = figma.viewport.center.y - height / 2 + randomCoord(100);

    figma.currentPage.appendChild(stickyNote);
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
