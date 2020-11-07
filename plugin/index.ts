import { hexToGl } from './helpers/utils';

function handleError() {
  figma.notify('Oops, could not load all fonts. Plugin cancelled.');
  figma.closePlugin();
}

// plugin

figma.showUI(__html__);
figma.ui.resize(300, 300);

// load fonts
figma
  .listAvailableFontsAsync()
  .then(() => {
    return figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
  })
  .catch(() => handleError());

figma.ui.onmessage = async msg => {
  if (msg.type === 'create-note') {
    const nodes = [];
    const viewportZoom = figma.viewport.zoom > 20 ? 20 : figma.viewport.zoom;
    const width = 200 / viewportZoom;
    const height = 200 / viewportZoom;
    const shadowWidth = 170 / viewportZoom;
    const shadowHeight = 30 / viewportZoom;
    const padding = 32 / viewportZoom;

    // create shadow
    const shadow = figma.createEllipse();
    shadow.name = 'Shadow';
    shadow.resizeWithoutConstraints(shadowWidth, shadowHeight);
    shadow.x = (width - shadowWidth) / 2;
    shadow.y = height - height / 12;
    shadow.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    shadow.opacity = 0.5;
    shadow.locked = true;
    shadow.effects = [
      { type: 'LAYER_BLUR', radius: 20 / viewportZoom, visible: true }
    ];
    nodes.push(shadow);

    // create sticky note container
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
        offset: { x: 0, y: 5 / viewportZoom },
        radius: 5 / viewportZoom,
        visible: true
      }
    ];
    nodes.push(note);

    // create sticky note content
    const text = figma.createText();
    note.name = 'Content';
    text.resizeWithoutConstraints(width - padding, height - padding);
    text.x = padding / 2;
    text.y = padding / 2;
    text.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    text.fontName = { family: 'Roboto', style: 'Regular' };
    text.fontSize = msg.fontSize / viewportZoom;
    text.textAlignHorizontal = 'CENTER';
    text.textAlignVertical = 'CENTER';

    // deal with empty note
    if (msg.content) {
      text.characters = msg.content;
    } else {
      text.characters = 'Text';
    }

    nodes.push(text);

    // group nodes together
    const stickyNote = figma.group(nodes, figma.currentPage);
    stickyNote.name = 'Sticky Note';

    // position sticky notes next to plugin window (estimated)
    stickyNote.x =
      figma.viewport.bounds.x + msg.cursorPosition.x / viewportZoom;
    stickyNote.y =
      figma.viewport.bounds.y + msg.cursorPosition.y / viewportZoom;

    figma.currentPage.appendChild(stickyNote);
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
