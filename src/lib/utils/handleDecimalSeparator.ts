export const handleDecimalSeparator = (e) => {
	const value = e.target.value;
	const sanitizedValue = value.replace(/[,.]/, '.').replace(/\.(?=.*\.)/g, '');
	const finalValue = sanitizedValue.replace(/[^\d.]/g, '');
	return finalValue;
};
