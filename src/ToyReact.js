class ElementWrapper {
  constructor(type) {
    this.type = type;
    this.props = Object.create(null);
    this.children = [];
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }
  appendChild(vchild) {
    this.children.push(vchild);
  }
  mountTo(range) {
    this.range = range;
    // 删除原本的内容
    range.deleteContents();
    const element = document.createElement(this.type);

    // setAttribute
    for (let name in this.props) {
      const value = this.props[name];
      const result = name.match(/^on([\s\S]+)$/);
      if (result) {
        element.addEventListener(RegExp.$1.toLowerCase(), value);
      } else {
        if (name === 'className') {
          name = 'class';
        }
        element.setAttribute(name, value);
      }
    }

    for (let child of this.children) {
      const range = document.createRange();
      if (element.children.length) {
        range.setStartAfter(element.lastChild);
        range.setEndAfter(element.lastChild);
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
      child.mountTo(range);
    }

    // 插入新的节点
    range.insertNode(element);
  }
}

class TextWrapper {
  constructor(content) {
    this.content = content;
    this.type = '#text';
    this.children = [];
    this.props = Object.create(null);
  }
  mountTo(range) {
    this.range = range;
    this.root = document.createTextNode(this.content);
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }
  get type() {
    return this.constructor.name;
  }
  mountTo(range) {
    this.range = range;
    this.update();
  }
  // 通过对比虚拟dom来选择性地更新实dom
  update() {
    const isSameNode = (newNode, oldNode) => {
      // 对比 type, children 长度, props
      if (newNode.type !== oldNode.type) {
        return false;
      }
      if (newNode.children.length !== oldNode.children.length) {
        return false;
      }
      if (Object.keys(newNode.props).length !== Object.keys(oldNode.props).length) {
        return false;
      }
      for (let name in newNode.props) {
        const value1 = newNode.props[name];
        const value2 = oldNode.props[name];
        const type1 = typeof value1;
        const type2 = typeof value2;
        debugger;
        if (type1 === 'function' && type2 === 'function') {
          console.log(value1, value2);
          if (value1.toString() !== value2.toString()) {
            return false;
          }
        } else if (type1 === 'object' && type2 === 'object') {
          if (JSON.stringify(value1) !== JSON.stringify(value2)) {
            return false;
          }
        } else if (value1 !== value2) {
          console.log(value1, value2);
          return false;
        }
      }
      return true;
    };

    const isSameTree = (newTree, oldTree) => {
      if (!isSameNode(newTree, oldTree)) {
        // console.log('all different', newTree, oldTree);
        return false;
      }
      if (newTree.children.length !== oldTree.children.length) {
        return false;
      }
      for (let i = 0; i < newTree.children.length; i++) {
        if (!isSameTree(newTree.children[i], oldTree.children[i])) {
          return false;
        }
      }
      return true;
    };

    const replace = (newTree, oldTree) => {
      if (isSameTree(newTree, oldTree)) {
        return;
      }
      if (!isSameNode(newTree, oldTree)) {
        newTree.mountTo(oldTree.range);
      } else {
        for (let i = 0; i < newTree.children.length; i++) {
          replace(newTree.children[i], oldTree.children[i]);
        }
      }
    };

    let vdom = this.render();

    if (this.vdom) {
      replace(vdom, this.vdom);
    } else {
      vdom.mountTo(this.range);
    }
    this.vdom = vdom;
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
            oldState[p] = newState[p];
          } else {
            merge(oldState[p], newState[p]);
          }
        } else {
          oldState[p] = newState[p];
        }
      }
    };
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    this.update();
  }
}

export const ToyReact = {
  createElement(type, attributes, ...children) {
    const element = typeof type === "string"
      ? new ElementWrapper(type)
      : new type;
    for (const name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    let insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === 'object' && child instanceof Array) {
          return insertChildren(child);
        }
        if (
          child instanceof Component
          || child instanceof TextWrapper
          || child instanceof ElementWrapper
        ) {
        } else if (typeof child === 'object') {
          child = '';
        } else {
          child = String(child);
        }

        if (typeof child === "string") {
          child = new TextWrapper(child);
        }
        element.appendChild(child);

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
