import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type portfolio_project = {
  title: string
  description: string
  stack: string[]
  link: string
}

type portfolio_experience = {
  company: string
  role: string
  period: string
  details: string
}

type portfolio_education = {
  institution: string
  degree: string
  period: string
}

type portfolio_profile = {
  name: string
  role: string
  location: string
  tagline: string
}

type portfolio_contact = {
  email: string
  phone: string
}

type portfolio_socials = {
  github: string
  linkedin: string
  x: string
}

type portfolio_data = {
  profile: portfolio_profile
  summary: string
  skills: string[]
  projects: portfolio_project[]
  experience: portfolio_experience[]
  education: portfolio_education[]
  contact: portfolio_contact
  socials: portfolio_socials
}

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
  const [portfolio_state, set_portfolio_state] = useState<portfolio_data | null>(null)
  const [command_input, set_command_input] = useState<string>('')
  const [line_state, set_line_state] = useState<terminal_line[]>([])
  const [line_counter, set_line_counter] = useState<number>(0)
  const [is_loading, set_is_loading] = useState<boolean>(true)
  const terminal_output_ref = useRef<HTMLDivElement | null>(null)
  const terminal_input_ref = useRef<HTMLInputElement | null>(null)

  const prompt_label = useMemo(function (): string {
    return 'satya@portfolio MINGW64 ~/profile'
  }, [])

  useEffect(function () {
    async function load_portfolio_data(): Promise<void> {
      set_is_loading(true)
      try {
        const response = await fetch('/portfolio_data.json')
        if (response.ok === false) {
          throw new Error('Unable to load portfolio data')
        }
        const data = (await response.json()) as portfolio_data
        set_portfolio_state(data)
        set_line_state([
          {
            line_id: 1,
            line_kind: 'system',
            line_text: 'Welcome to terminal portfolio v1.0.0',
          },
          {
            line_id: 2,
            line_kind: 'system',
            line_text: 'Type help to see available commands.',
          },
        ])
        set_line_counter(2)
      } catch {
        set_line_state([
          {
            line_id: 1,
            line_kind: 'error',
            line_text: 'Failed to load portfolio JSON data.',
          },
        ])
        set_line_counter(1)
      } finally {
        set_is_loading(false)
      }
    }

    void load_portfolio_data()
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
  }, [is_loading])

  function create_line(line_kind: 'input' | 'output' | 'error' | 'system', line_text: string, next_index: number): terminal_line {
    return {
      line_id: next_index,
      line_kind: line_kind,
      line_text: line_text,
    }
  }

  function get_help_lines(start_index: number): terminal_line[] {
    const command_help = [
      'help            : list all commands',
      'about           : show profile intro',
      'summary         : show short summary',
      'skills          : show skill list',
      'projects        : show all projects',
      'experience      : show work experience',
      'education       : show education details',
      'contact         : show email and phone',
      'socials         : show social links',
      'cat <section>   : raw json for section',
      'ls              : list available sections',
      'date            : show current date and time',
      'whoami          : show identity',
      'pwd             : show current path',
      'clear           : clear terminal output',
    ]

    return command_help.map(function (item: string, item_index: number): terminal_line {
      return create_line('output', item, start_index + item_index)
    })
  }

  function get_json_section(section_name: string, data: portfolio_data): unknown {
    const section_map: Record<string, unknown> = {
      profile: data.profile,
      summary: data.summary,
      skills: data.skills,
      projects: data.projects,
      experience: data.experience,
      education: data.education,
      contact: data.contact,
      socials: data.socials,
    }
    if (Object.prototype.hasOwnProperty.call(section_map, section_name) === false) {
      return null
    }
    return section_map[section_name]
  }

  function execute_command(raw_command: string, data: portfolio_data | null, start_index: number): command_result {
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
    const command_argument = command_parts.length > 1 ? command_parts[1].toLowerCase() : ''
    let next_line_index = start_index

    if (base_command === 'clear') {
      return {
        output_lines: [],
        clear_screen: true,
      }
    }

    if (base_command === 'help') {
      const help_lines = get_help_lines(next_line_index)
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

    if (data === null) {
      result_lines.push(create_line('error', 'Portfolio data is not loaded yet.', next_line_index))
      return {
        output_lines: result_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'ls') {
      result_lines.push(
        create_line(
          'output',
          'profile summary skills projects experience education contact socials',
          next_line_index,
        ),
      )
      return {
        output_lines: result_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'about') {
      result_lines.push(create_line('output', data.profile.name + ' - ' + data.profile.role, next_line_index))
      next_line_index = next_line_index + 1
      result_lines.push(create_line('output', data.profile.location, next_line_index))
      next_line_index = next_line_index + 1
      result_lines.push(create_line('output', data.profile.tagline, next_line_index))
      return {
        output_lines: result_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'summary') {
      result_lines.push(create_line('output', data.summary, next_line_index))
      return {
        output_lines: result_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'skills') {
      const skill_lines = data.skills.map(function (skill_item: string, skill_index: number): terminal_line {
        return create_line('output', String(skill_index + 1) + '. ' + skill_item, next_line_index + skill_index)
      })
      return {
        output_lines: skill_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'projects') {
      const project_lines: terminal_line[] = []
      data.projects.forEach(function (project_item: portfolio_project, project_index: number): void {
        const current_index = next_line_index + project_index * 4
        project_lines.push(create_line('output', '[' + String(project_index + 1) + '] ' + project_item.title, current_index))
        project_lines.push(create_line('output', project_item.description, current_index + 1))
        project_lines.push(create_line('output', 'stack: ' + project_item.stack.join(', '), current_index + 2))
        project_lines.push(create_line('output', 'link : ' + project_item.link, current_index + 3))
      })
      return {
        output_lines: project_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'experience') {
      const experience_lines: terminal_line[] = []
      data.experience.forEach(function (experience_item: portfolio_experience, experience_index: number): void {
        const current_index = next_line_index + experience_index * 3
        experience_lines.push(
          create_line(
            'output',
            experience_item.role + ' | ' + experience_item.company + ' | ' + experience_item.period,
            current_index,
          ),
        )
        experience_lines.push(create_line('output', experience_item.details, current_index + 1))
        experience_lines.push(create_line('output', '---', current_index + 2))
      })
      return {
        output_lines: experience_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'education') {
      const education_lines: terminal_line[] = []
      data.education.forEach(function (education_item: portfolio_education, education_index: number): void {
        const current_index = next_line_index + education_index * 2
        education_lines.push(
          create_line(
            'output',
            education_item.degree + ' | ' + education_item.institution,
            current_index,
          ),
        )
        education_lines.push(create_line('output', education_item.period, current_index + 1))
      })
      return {
        output_lines: education_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'contact') {
      result_lines.push(create_line('output', 'email: ' + data.contact.email, next_line_index))
      next_line_index = next_line_index + 1
      result_lines.push(create_line('output', 'phone: ' + data.contact.phone, next_line_index))
      return {
        output_lines: result_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'socials') {
      result_lines.push(create_line('output', 'github : ' + data.socials.github, next_line_index))
      next_line_index = next_line_index + 1
      result_lines.push(create_line('output', 'linkedin: ' + data.socials.linkedin, next_line_index))
      next_line_index = next_line_index + 1
      result_lines.push(create_line('output', 'x       : ' + data.socials.x, next_line_index))
      return {
        output_lines: result_lines,
        clear_screen: false,
      }
    }

    if (base_command === 'cat') {
      if (command_argument.length === 0) {
        result_lines.push(create_line('error', 'usage: cat <section>', next_line_index))
        return {
          output_lines: result_lines,
          clear_screen: false,
        }
      }

      const section_data = get_json_section(command_argument, data)
      if (section_data === null) {
        result_lines.push(create_line('error', 'section not found: ' + command_argument, next_line_index))
        return {
          output_lines: result_lines,
          clear_screen: false,
        }
      }

      const json_lines = JSON.stringify(section_data, null, 2).split('\n')
      json_lines.forEach(function (json_line: string, json_index: number): void {
        result_lines.push(create_line('output', json_line, next_line_index + json_index))
      })

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
    const command_output = execute_command(entered_command, portfolio_state, line_counter + 2)

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
      {/* <header className="terminal_header">
        <div className="header_dots">
          <span className="header_dot header_dot_red"></span>
          <span className="header_dot header_dot_yellow"></span>
          <span className="header_dot header_dot_green"></span>
        </div>
        <p className="header_title">/usr/bin/bash - portfolio</p>
      </header> */}

      <section className="terminal_body" ref={terminal_output_ref}>
        {line_state.map(function (line_item: terminal_line): React.ReactNode {
          return (
            <p key={line_item.line_id} className={'terminal_line line_' + line_item.line_kind}>
              {line_item.line_text}
            </p>
          )
        })}

        {is_loading === true ? <p className="terminal_line line_system">loading portfolio_data.json ...</p> : null}

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
