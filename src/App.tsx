import { useEffect, useRef, useState } from 'react'
import './App.css'

type terminal_line = {
  line_id: number
  line_kind: 'input' | 'output' | 'error' | 'system'
  line_text: string
}

type command_result = {
  output_lines: terminal_line[]
  clear_screen: boolean
}

function App() {
  const [command_input, set_command_input] = useState<string>('')
  const [line_state, set_line_state] = useState<terminal_line[]>([])
  const [line_counter, set_line_counter] = useState<number>(0)
  const terminal_output_ref = useRef<HTMLDivElement | null>(null)
  const terminal_input_ref = useRef<HTMLInputElement | null>(null)

  const prompt_label = 'satya@portfolio MINGW64 ~/profile'

  useEffect(function () {
    set_line_state([
      {
        line_id: 1,
        line_kind: 'system',
        line_text: 'Welcome to terminal portfolio v0.1.0',
      },
      {
        line_id: 2,
        line_kind: 'system',
        line_text: 'Type help to see available commands.',
      },
    ])
    set_line_counter(2)
  }, [])

  useEffect(function () {
    if (terminal_output_ref.current !== null) {
      terminal_output_ref.current.scrollTop = terminal_output_ref.current.scrollHeight
    }
  }, [line_state])

  useEffect(function () {
    if (terminal_input_ref.current !== null) {
      terminal_input_ref.current.focus()
    }
  }, [])

  function create_line(line_kind: 'input' | 'output' | 'error' | 'system', line_text: string, next_index: number): terminal_line {
    return {
      line_id: next_index,
      line_kind: line_kind,
      line_text: line_text,
    }
  }

  function execute_command(raw_command: string, start_index: number): command_result {
    const result_lines: terminal_line[] = []
    const trimmed_command = raw_command.trim()

    if (trimmed_command.length === 0) {
      return {
        output_lines: result_lines,
        clear_screen: false,
      }
    }

    const command_parts = trimmed_command.split(/\s+/)
    const base_command = command_parts[0].toLowerCase()
    let next_line_index = start_index

    if (base_command === 'clear') {
      return {
        output_lines: [],
        clear_screen: true,
      }
    }

    if (base_command === 'help') {
      const help_lines = [
        'help     : show this help message',
        'about    : show basic info',
        'date     : show current date and time',
        'whoami   : show current user',
        'pwd      : show current directory',
        'clear    : clear the terminal'
      ].map(function (item: string, item_index: number): terminal_line {
        return create_line('output', item, next_line_index + item_index)
      })
      return {
        output_lines: help_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'date') {
      const date_text = new Date().toLocaleString()
      result_lines.push(create_line('output', date_text, next_line_index))
      return {
        output_lines: result_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'pwd') {
      result_lines.push(create_line('output', '/home/satya/profile', next_line_index))
      return {
        output_lines: result_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'whoami') {
      result_lines.push(create_line('output', 'satya', next_line_index))
      return {
        output_lines: result_lines,
        clear_screen: false,
      }
    }

    result_lines.push(create_line('error', 'command not found: ' + base_command, next_line_index))
    next_line_index = next_line_index + 1
    result_lines.push(create_line('system', 'Type help to list commands.', next_line_index))
    return {
      output_lines: result_lines,
      clear_screen: false,
    }
  }

  function handle_command_submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const entered_command = command_input
    const existing_lines = line_state
    const input_line = create_line('input', prompt_label + ' $ ' + entered_command, line_counter + 1)
    const command_output = execute_command(entered_command, line_counter + 2)

    if (command_output.clear_screen === true) {
      set_line_state([])
      set_line_counter(0)
      set_command_input('')
      return
    }

    const updated_lines = existing_lines.concat([input_line], command_output.output_lines)
    const latest_line = updated_lines.length > 0 ? updated_lines[updated_lines.length - 1] : null
    const latest_line_id = latest_line !== null ? latest_line.line_id : line_counter

    set_line_state(updated_lines)
    set_line_counter(latest_line_id)
    set_command_input('')
  }

  return (
    <main className="" onClick={function (): void {
      if (terminal_input_ref.current !== null) {
        terminal_input_ref.current.focus()
      }
    }}>
      <section className="terminal_body" ref={terminal_output_ref}>
        {line_state.map(function (line_item: terminal_line): React.ReactNode {
          return (
            <p key={line_item.line_id} className={'terminal_line line_' + line_item.line_kind}>
              {line_item.line_text}
            </p>
          )
        })}

        <form className="terminal_command_form" onSubmit={handle_command_submit}>
          <label htmlFor="terminal_command_input" className="terminal_prompt_label">
            {prompt_label} $
          </label>
          <input
            id="terminal_command_input"
            ref={terminal_input_ref}
            value={command_input}
            onChange={function (event: React.ChangeEvent<HTMLInputElement>): void {
              set_command_input(event.target.value)
            }}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="terminal_command_input"
          />
        </form>
      </section>
    </main>
  )
} 

export default App
