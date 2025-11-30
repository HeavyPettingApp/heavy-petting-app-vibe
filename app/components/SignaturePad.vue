<script setup>
import SignaturePad from "signature_pad"
import { ref, onMounted, watch, nextTick } from "vue"

const props = defineProps({
  invalid: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: 600,
  },
  height: {
    type: Number,
    default: 400,
  },
  penColorRGB: {
    type: String,
    default: "rgb(0, 0, 0)",
  },
  backgroundColorRGB: {
    type: String,
    default: "rgba(255, 255, 255)",
  },
  svgData: {
    type: String,
    default: "",
  },
})

const emit = defineEmits(["signature-started", "end-stroke", "cleared"])

const signaturePadRef = ref(null)
let signaturePad = null

function resizeCanvas(canvas) {
  const ratio = Math.max(window.devicePixelRatio || 1, 1)
  canvas.width = canvas.offsetWidth * ratio
  canvas.height = canvas.offsetHeight * ratio
  canvas.getContext("2d").scale(ratio, ratio)
  //signaturePad.clear() // otherwise isEmpty() might return incorrect value
}

const clearSignature = () => {
  if (signaturePad) {
    signaturePad.clear()
    emit("signature-started", false)
    emit("cleared")
  }
}

const clearSignatureSilently = () => {
  if (signaturePad) {
    signaturePad.clear()
    // Don't emit events when clearing silently
  }
}

const restoreSignature = (svgData) => {
  if (!signaturePad || !svgData) return

  try {
    console.log("Restoring signature from SVG data")

    // Convert SVG to canvas/data URL since fromSVG doesn't exist
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    img.onload = () => {
      // Set canvas size to match signature pad
      canvas.width = signaturePadRef.value.width
      canvas.height = signaturePadRef.value.height

      // Fill with background color first
      ctx.fillStyle = props.backgroundColorRGB
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Then draw the signature image on top
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Convert to data URL and restore to signature pad
      const dataURL = canvas.toDataURL()
      signaturePad.fromDataURL(dataURL)

      emit("signature-started", true) // Mark as having signature content
      console.log("Signature restored successfully")
    }

    img.onerror = (error) => {
      console.error("Error loading SVG image:", error)
    }

    // Create blob URL from SVG string
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)
    img.src = url
  } catch (error) {
    console.error("Error restoring signature from SVG:", error)
  }
}

// Watch for changes in svgData prop
watch(
  () => props.svgData,
  (newSvgData) => {
    if (newSvgData && signaturePad) {
      restoreSignature(newSvgData)
    }
  }
)

onMounted(() => {
  const canvas = signaturePadRef.value
  signaturePad = new SignaturePad(canvas, {
    minWidth: 2,
    maxWidth: 5,
    penColor: props.penColorRGB,
    backgroundColor: props.backgroundColorRGB,
  })

  signaturePad.addEventListener(
    "beginStroke",
    () => {
      console.log("Signature started")
      emit("signature-started", true)
    },
    { once: true }
  )

  signaturePad.addEventListener("endStroke", () => {
    console.log("end stroke")
    const svgData = signaturePad.toSVG()
    console.log("SVG Data length:", svgData.length)
    console.log(
      "SVG Data preview:",
      svgData.substring(0, 200) + (svgData.length > 200 ? "..." : "")
    )
    emit("end-stroke", svgData)
  })

  window.addEventListener("resize", resizeCanvas(canvas))
  resizeCanvas(canvas)

  // Only clear if no SVG data is provided - don't clear existing signatures!
  if (!props.svgData) {
    clearSignatureSilently() // Use silent clear to avoid triggering form updates
  }

  // Restore signature if SVG data is provided
  if (props.svgData) {
    console.log("Restoring signature with data:", props.svgData.substring(0, 100) + "...")
    nextTick(() => {
      restoreSignature(props.svgData)
    })
  }
})
</script>

<template>
  <canvas
    ref="signaturePadRef"
    class="signature-pad"
    :class="props.invalid ? 'border-2 border-red-500' : ''"
    :width="props.width"
    :height="props.height"
  ></canvas>
  <Button @click="clearSignature" class="mt-2"> Clear Signature</Button>
</template>
