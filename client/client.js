
import "babel-polyfill";
import { Socket } from "engine.io-client";
import * as React from "react";
import { render, findDOMNode } from "react-dom";

class OutputLine extends React.Component {
  render() {
    return <div>{ this.props.text }</div>;
  }
}

class Output extends React.Component {
  render() {
    let children = this.props.loglines.map((line, i) => {
      return <OutputLine key={ i } text={ line } />;
    });
    return <div style={{
      fontFamily: "monospace",
      whiteSpace: "pre"
    }}>
      { children }
    </div>;
  }
}

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {input: "", checked: false};
  }

  componentDidMount() {
    let input = findDOMNode(this.refs.input);
    input.focus();
  }

  onChange(event) {
    this.setState({input: event.target.value});
  }

  onCheckboxChange(event) {
    this.setState({checked: event.target.checked});
  }

  onSwitch(event) {

  }

  onSubmit(event) {
    event.preventDefault();
    this.props.send(this.state.input);
    this.setState({input: ""});
    let input = findDOMNode(this.refs.input);
    input.value = "";
  }

  render() {
    let actualInput = null;
    if (this.state.checked) {
      actualInput = <textarea
        style={{
          width: "85%",
          height: "3em",
          verticalAlign: "middle"
        }}
        ref="input"
        onChange={ this.onChange.bind(this) }
        />;
    } else {
      actualInput = <input
        style={{
          width: "85%",
          verticalAlign: "middle"
        }}
        ref="input"
        onChange={ this.onChange.bind(this) }
        />;
    }
    return <div style={{
      position: "fixed",
      left: "7px",
      right: "7px",
      bottom: "7px"
    }}>
      <form
        style={{
          margin: "0px"
        }}
        onSubmit={ this.onSubmit.bind(this) }>
        { actualInput }
        <input
          type="checkbox"
          checked={ this.state.checked }
          style={{
            verticalAlign: "middle"
          }}
          onChange={ this.onCheckboxChange.bind(this) } />
        <button
          style={{
            width: "10%",
            verticalAlign: "middle"
          }}>
          Send
        </button>
      </form>
    </div>;
  }
}

class Screen extends React.Component {
  render() {
    return <div>
      <Output loglines={ this.props.loglines } />
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <Input send={ this.props.send }/>
    </div>;
  }
}

let loglines = [];

function draw() {
  render(
    <Screen
      loglines={ loglines }
      send={ send } />,
    document.getElementById("react-root"));
}


function open() {
  return new Promise((resolve, reject) => {
    let socket = Socket("ws://localhost:8080");
    socket.on("open", () => {
      resolve(socket);
    });
  });
}

let send = null;

async function main() {
  let socket = await open();
  send = (data) => {
    let prefix = "> ";
    for (let line of data.split("\n")) {
      loglines.push(prefix + line);
      if (prefix === "> ") {
        prefix = "  ";
      }
    }
    draw();
    socket.send(data);
  };
  draw();
  socket.on("message", (data) => {
    loglines.push(data.toString());
    draw();
  });
}

main();
