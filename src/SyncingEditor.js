import React, { useState, useRef, useEffect } from 'react'
import { Editor } from 'slate-react'
import mitt from 'mitt'
import { initialValue } from './slateInitialValue'


const SyncingEditor = (props) => {
  let emitter = mitt()
  const [value, setValue] = useState(initialValue)
  const editor = useRef(null)
  const remote = useRef(false)

  const id = useRef(`${Date.now()}`);

  useEffect(() => {
    emitter.on('*', (type, ops) => {
      if (id.current === type) {
        remote.current = true
        ops.forEach(op => editor.current.applyOperations(op))
        remote.current = false
      }
    })
  })

  return (
    <Editor
      ref={editor}
      value={value}
      style={{
        backgroundColor: '#fafafa',
        maxWidth: 800,
        minHeight: 150
      }}
      onChange={opts => {
        setValue(opts.value)

        const ops = opts.operations
          .filter(o => {
            if (o) {
              return (
                o.type !== "set_selection" &&
                o.type !== "set_value" &&
                (!o.data || !o.data.has("source"))
              )
            }
            return false
          })
          .toJS()
          .map(o => ({ ...o, data: { source: "one" } }))

        if (ops.length && !remote.current) {
          emitter.emit(id.current, ops);
        }

      }}
    />
  )
}

export default SyncingEditor
