import { ToyReact, Component } from "./ToyReact";

class MyComponent extends Component {
  render() {
    return (
      <div class="hello">
        <span>hello</span>
        &nbsp;
        <span>world</span>
        {this.children}
      </div>
    );
  }
}

const a = (
  <MyComponent name="a" id="aa">
    <span>!</span>
  </MyComponent>
);

ToyReact.render(a, document.body);
