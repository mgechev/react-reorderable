var ReactSortable = React.createClass({displayName: "ReactSortable",
  getInitialState: function () {
    return { order: [] };
  },
  render: function () {
    var children = this.props.children.map(function (c) {
      return (
        React.createElement(ReactDrag, {handle: this.props.handle}, 
          c
        )
      );
    }, this);
    return (
      React.createElement("div", null, 
        children
      )
    );
  }
});
