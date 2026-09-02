const toNumber = (value) => {
	const number = Number(value)
	return Number.isFinite(number) ? number : 0
}

export const normalizeCartItem = (item = {}) => {
	const count = Math.max(0, parseInt(item.count ?? item.quantity ?? item.number ?? 0, 10) || 0)
	const price = toNumber(item.price ?? item.product_price)
	const specs = item.props_text || item.specs || item.spec || ''
	const hasTotalPrice = item.totalPrice !== undefined || item.total_price !== undefined
	const totalPrice = hasTotalPrice
		? toNumber(item.totalPrice ?? item.total_price)
		: price * count
	return {
		...item,
		count,
		price,
		totalPrice,
		specs,
		props_text: specs
	}
}

export const normalizeCartData = (cartData = {}) => {
	const source = cartData && typeof cartData === 'object' && !Array.isArray(cartData) ? cartData : {}
	const list = Array.isArray(source.list)
		? source.list.map((item) => normalizeCartItem(item)).filter((item) => item.count > 0)
		: []
	const total = list.reduce((sum, item) => sum + item.count, 0)
	const price = list.reduce((sum, item) => sum + item.totalPrice, 0)
	return {
		...source,
		list,
		total,
		price
	}
}

const isSameCartItem = (currentItem = {}, nextItem = {}) => {
	if (currentItem.id !== nextItem.id) {
		return false
	}
	return (currentItem.props_text || currentItem.specs || '') === (nextItem.props_text || nextItem.specs || '')
}

export const appendCartItem = (cartData = {}, item = {}, matcher = isSameCartItem) => {
	const nextCartData = normalizeCartData(cartData)
	const nextItem = normalizeCartItem(item)
	const index = nextCartData.list.findIndex((currentItem) => matcher(normalizeCartItem(currentItem), nextItem))
	if (index > -1) {
		const currentItem = normalizeCartItem(nextCartData.list[index])
		const count = currentItem.count + nextItem.count
		nextCartData.list.splice(index, 1, {
			...currentItem,
			...nextItem,
			count,
			totalPrice: nextItem.price * count
		})
		return normalizeCartData(nextCartData)
	}
	nextCartData.list.push(nextItem)
	return normalizeCartData(nextCartData)
}

export const buildCartItemFromOrderProduct = (product = {}) => {
	const specs = product.props_text || product.specs || ''
	return normalizeCartItem({
		id: product.product_id || product.id,
		name: product.product_name || product.name,
		price: product.price || product.product_price || 0,
		count: product.quantity || product.count || 1,
		totalPrice: product.total_price,
		image: product.image || '',
		specs,
		props_text: specs,
		spec_type: 'single',
		specSelected: true
	})
}

export const buildCartDataFromProducts = (products = []) => {
	const list = Array.isArray(products) ? products.map((product) => buildCartItemFromOrderProduct(product)) : []
	return normalizeCartData({ list })
}

export const mergeOrderProductsToCart = (cartData = {}, products = []) => {
	let nextCartData = normalizeCartData(cartData)
	;(Array.isArray(products) ? products : []).forEach((product) => {
		nextCartData = appendCartItem(nextCartData, buildCartItemFromOrderProduct(product))
	})
	return normalizeCartData(nextCartData)
}