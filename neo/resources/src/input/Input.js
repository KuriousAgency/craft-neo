import $ from 'jquery'
import '../jquery-extensions'

import Garnish from 'garnish'
import Craft from 'craft'

import NS from '../namespace'

import BlockType from './BlockType'
import Block from './Block'

import renderTemplate from './templates/input.twig'
import '../twig-extensions'
import './styles/input.scss'

const _defaults = {
	namespace: [],
	blockTypes: [],
	inputId: null,
	maxBlocks: 0
}

export default Garnish.Base.extend({

	_templateNs: [],
	_blockTypes: [],
	_blocks: [],

	init(settings = {})
	{
		settings = Object.assign({}, _defaults, settings)

		this._templateNs = NS.parse(settings.namespace)

		NS.enter(this._templateNs)

		this.$container = $('#' + settings.inputId).append(renderTemplate({
			blockTypes: settings.blockTypes
		}))

		NS.leave()

		for(let btInfo of settings.blockTypes)
		{
			let blockType = new BlockType(btInfo)
			this._blockTypes.push(blockType)
			this._blockTypes[blockType.getHandle()] = blockType
		}

		const $neo = this.$container.find('[data-neo]')
		this.$blocksContainer = $neo.filter('[data-neo="container.blocks"]')
		this.$blockButtons = $neo.filter('[data-neo="button.addBlock"]')

		this._blockSort = new Garnish.DragSort(null, {
			container: this.$blocksContainer,
			handle: '[data-neo-b="button.move"]',
			axis: 'y',
			filter: () =>
			{
				// Only return all the selected items if the target item is selected
				if(this._blockSort.$targetItem.hasClass('sel'))
				{
					return this.getSelectedBlocks()
				}
				else
				{
					return this._blockSort.$targetItem
				}
			},
			collapseDraggees: true,
			magnetStrength: 4,
			helperLagBase: 1.5,
			helperOpacity: 0.9,
			onSortChange: () => this._updateBlockOrder()
		})

		this.addListener(this.$blockButtons, 'click', '@newBlock')
	},

	addBlock(block, index = -1)
	{
		if(index >= 0 && index < this._blocks.length)
		{
			this._blocks = this._blocks.splice(index, 0, block)
			block.$container.insertAt(index, this.$blocksContainer)
		}
		else
		{
			this._blocks.push(block)
			this.$blocksContainer.append(block.$container)
		}

		this._blockSort.addItems(block.$container)

		block.initUi()

		this._updateBlockOrder()
	},

	getSelectedBlocks()
	{

	},

	'@newBlock'(e)
	{
		const $button = $(e.currentTarget)
		const blockTypeHandle = $button.attr('data-neo-info')
		const blockType = this._blockTypes[blockTypeHandle]
		const blockId = Block.getNewId()

		const block = new Block({
			namespace: this._templateNs,
			blockType: blockType,
			id: blockId
		})

		this.addBlock(block)
	},

	_updateBlockOrder()
	{

	}
})
