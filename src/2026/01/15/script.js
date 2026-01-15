const ctx = document.getElementsByTagName("canvas").item(0).getContext("2d");

const width = ctx.canvas.clientWidth;
const height = ctx.canvas.clientHeight;
const dpr = window.devicePixelRatio || 1;

ctx.canvas.style.width = `${width}px`;
ctx.canvas.style.height = `${height}px`;

ctx.canvas.width = width * dpr;
ctx.canvas.height = height * dpr;

ctx.scale(dpr, dpr);

const rectCount = 32;
const rectWidth = width / rectCount;
const rectHeight = height / rectCount;

ctx.textBaseline = "middle";

const debugOutput = document.querySelector("pre");

const expressionInput = document.querySelector("[name=expression]");

let expression = expressionInput.value;

expressionInput.addEventListener("change", () => {
	expression = expressionInput.value;
});

document.querySelectorAll("input[type=button]").forEach((el) =>
	el.addEventListener("click", () => {
		console.log(el.value);
		expressionInput.value = el.value;
		expressionInput.dispatchEvent(new Event("change"));
	}),
);

function f(x, y, t) {
	try {
		const value = window.execute(expression, { x, y, t });

		return value;
	} catch {
		return 1;
	}
}

function hsvToRgb(hue, sat, val) {
	const h = hue / 360;
	const s = 100 / sat;
	const v = 100 / val;
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	let r;
	let g;
	let b;

	switch (i % 6) {
		case 0:
			((r = v), (g = t), (b = p));
			break;
		case 1:
			((r = q), (g = v), (b = p));
			break;
		case 2:
			((r = p), (g = v), (b = t));
			break;
		case 3:
			((r = p), (g = q), (b = v));
			break;
		case 4:
			((r = t), (g = p), (b = v));
			break;
		case 5:
			((r = v), (g = p), (b = q));
			break;
	}

	return {
		r: r * 255,
		g: g * 255,
		b: b * 255,
	};
}

function color(x, y, t) {
	// Multiplyig by 360 here would give color values that "loop" back around to red
	// Multiplyig by 300 instead limits the final color or purple
	const h = (x / width) * 360;
	return hsvToRgb(h, 100, 100);
}

function draw(t) {
	ctx.clearRect(0, 0, width, height);

	for (let i = 0; i < rectCount; i++) {
		for (let j = 0; j < rectCount; j++) {
			const x = Math.floor(i * rectWidth);
			const y = Math.floor(j * rectHeight);
			const value = f(i, j, t);
			const rgb = color(x, y, t);
			ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${value})`;
			ctx.fillRect(x, y, rectWidth + 0.5, rectHeight + 0.5);
		}
	}

	debugOutput.textContent = t;
}

function loop() {
	let previousTimestamp = 0;
	const stepMs = 1000 / 60;

	function callback(timestamp) {
		if (timestamp - previousTimestamp > stepMs) {
			draw(timestamp);
			previousTimestamp = timestamp;
		}

		requestAnimationFrame(callback);
	}

	requestAnimationFrame(callback);
}

loop();
