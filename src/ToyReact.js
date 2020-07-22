class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    const result = name.match(/^on([\s\S]+)$/);
    if (result) {
      this.root.addEventListener(RegExp.$1.toLowerCase(), value);
    } else {
      if (name === 'className') {
        name = 'class';
      }
      this.root.setAttribute(name, value);
    }
  }
  appendChild(vchild) {
    let range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    vchild.mountTo(range);
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }
  mountTo(range) {
    this.range = range;
    this.update();
  }
  update() {
    let placeholder = document.createComment('placeholder');
    let range = document.createRange();
    range.setStart(this.range.endContainer, this.range.endOffset);
    range.setEnd(this.range.endContainer, this.range.endOffset);
    range.insertNode(placeholder);

    this.range.deleteContents();

    let vdom = this.render();
    vdom.mountTo(this.range);
  }
  setAttribute(name, value) {
    this.props[name] = value;
    this[name] = value;
  }
  appendChild(child) {
    this.children.push(child);
  }
  setState(state) {
    const merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === 'object') {
          if (typeof oldState[p] !== 'object') {
            oldState[p] = {};
          }
          merge(oldState[p], newState[p]);
        } else {
          oldState[p] = newState[p];
        }
      }
    };
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    console.log(this.state);
    this.update();
  }
}

export const ToyReact = {
  createElement(type, attributes, ...children) {
    const element =
      typeof type === "string" ? new ElementWrapper(type) : new type;
    for (const name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    let insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === "string") {
          child = new TextWrapper(child);
        }
        if (typeof child === 'object' && child instanceof Array) {
          insertChildren(child);
        } else {
          if (!child instanceof Component && !child instanceof TextWrapper && !child instanceof ElementWrapper) {
            child = String(child);
          }
          element.appendChild(child);
        }
      }
    };
    insertChildren(children);
    return element;
  },
  render(vdom, element) {
    let range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vdom.mountTo(range);
  },
};
