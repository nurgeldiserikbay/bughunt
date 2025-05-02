export function getCloseValue(list: number[], value: number) {
	const d = list.map((v) => Math.abs(v - value))
	const min = Math.min(...d)
	const minInd = d.findIndex((i) => i === min)
	return list[minInd]
}
