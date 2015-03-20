var ReactSortable = React.createClass({
  getInitialState: function () {
    return { order: [] };
  },
  render: function () {
    var children = this.props.children.map(function (c) {
      return (
        <ReactDrag handle={this.props.handle}>
          {c}
        </ReactDrag>
      );
    }, this);
    return (
      <div>
        {children}
      </div>
    );
  }
});
