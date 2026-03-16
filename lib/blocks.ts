export type BlockType = 'text' | 'heading' | 'bullet-list' | 'checkbox' | 'image' | 'video'

export interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean
  url?: string
}

export const createBlock = (type: BlockType = 'text', content: string = ''): Block => ({
  id: Math.random().toString(36).substr(2, 9),
  type,
  content,
  checked: false,
})
