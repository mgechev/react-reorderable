function getClosestSortable(el) {
  while (el) {
    if (el.className &&
        el.className.indexOf('react-sortable-item') >= 0) {
      return el;
    }
    el = el.parentNode;
  }
  return null;
}

function getCurrentPosition(node) {
  var p = node.parentNode;
  var siblings = p.children;
  for (var i = 0; i < siblings.length; i += 1) {
    if (siblings[i] === node) {
      return {
        prev: siblings[i - 1] || null,
        next: siblings[i + 1] || null
      };
    }
  }
}

function getNodePosition(node) {
  return {
    next: getNextNode(node),
    prev: getPrevNode(node)
  };
}

function getNextNode(node) {
  var p = node.parentNode;
  var siblings = p.children;
  var minDistance = Infinity;
  var next = null;
  var current;
  for (var i = 0; i < siblings.length; i += 1) {
    current = siblings[i];
    if (current !== node) {
      if (current.offsetY > node.offsetY &&
          current.offsetY - node.offsetY < minDistance) {
        minDistance = current.offsetY - node.offsetY;
        next = current;
      }
    }
  }
  return next;
}

function getPrevNode(node) {
  var p = node.parentNode;
  var siblings = p.children;
  var minDistance = Infinity;
  var prev = null;
  var current;
  for (var i = siblings.length - 1; i >= 0; i -= 1) {
    current = siblings[i];
    if (current !== node) {
      if (current.offsetY < node.offsetY &&
          node.offsetY - current.offsetY < minDistance) {
        minDistance = node.offsetY - current.offsetY;
        prev = current;
      }
    }
  }
  return prev;
}

var ReactSortable = React.createClass({
  _indexChildren: function (c) {
    var ids = [];
    var prefix = 'node-';
    var id;
    this.sortableMap = {};
    for (var i = 0; i < c.length; i += 1) {
      id = prefix + (i + 1);
      ids.push(id);
      c[i] = React.addons.cloneWithProps(c[i], {
        className: 'react-sortable-item',
        'data-sortable-id': id
      });
      this.sortableMap[id] = c[i];
    }
    this.setState({
      order: ids
    });
  },
  componentWillMount: function () {
    children: this._indexChildren(this.props.children)
//    this.setProps({
//    });
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.children) {
      this._indexChildren(nextProps.children);
    }
  },
  getInitialState: function () {
    // Our state doesn't depends on activeNode
    // so it is not required to resides in the state
    this.activeNode = null;
    return { order: [] };
  },
  onDragStart: function (e) {
    // could be a handle
    var node = getClosestSortable(e.target);
    node.style.position = 'relative';
    this.activeNode = node;
  },
  onDragStop: function (e) {
    var node = getClosestSortable(e.target);
    node.style.position = 'static';
    this.activeNode = null;
  },
  onDrag: function (e) {
    var position = getNodePosition(this.activeNode);
    var currentPosition = getCurrentPosition(this.activeNode);
    if (position) {
      // Only one of the positions could differ only
      // if the children update somehow but we should lose
      // the drag anyway...
      if (position.next !== currentPosition.next ||
          position.prev !== currentPosition.prev) {
        // update the state
        var id = this.activeNode.getAttribute('data-sortable-id');
        var order = this.state.order;
        order.splice(order.indexOf(id), 1);
        if (!position.next) {
          order.push(id);
        } else if (!position.prev) {
          order.unshift(id);
        } else {
          var prevIdx =
            order.indexOf(position.prev.getAttribute('data-sortable-id'));
          order.splice(prevIdx + 1, 0, id);
        }
        this.setState({
          order: order
        });
      }
    }
  },
  render: function () {
    console.log(this.state);
    var children = this.state.order.map(function (id) {
      var c = this.sortableMap[id];
      return (
        <ReactDrag handle={this.props.handle}
          onDrag={this.onDrag}
          onStart={this.onDragStart}
          onStop={this.onDragStop}>
          {c}
        </ReactDrag>
      );
    }, this);
    return (
      <div ref="wrapper">
        {children}
      </div>
    );
  }
});
