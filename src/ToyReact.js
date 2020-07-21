class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(vchild) {
    vchild.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

export class Component {
  mountTo(parent) {
    let vdom = this.render();
    vdom.mountTo(parent);
  }
  setAttribute(name, value) {
    this[name] = value;
  }
}

export const ToyReact = {
  createElement(type, attributes, ...children) {
    const element =
      typeof type === "string" ? new ElementWrapper(type) : new type;
    for (const name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    for (let child of children) {
      if (typeof child === "string") {
        child = new TextWrapper(child);
      }
      element.appendChild(child);
    }
    return element;
  },
  render(vdom, element) {
    vdom.mountTo(element);
  },
};
