import { ToyReact, Component } from "./ToyReact";

class MyComponent extends Component {
  render() {
    return (
      <div class="hello">
        <h1>hahaha</h1>
        <h2>hehehe</h2>
      </div>
    );
  }
}

const a = <MyComponent name="a" id="aa"></MyComponent>;

ToyReact.render(a, document.body);
