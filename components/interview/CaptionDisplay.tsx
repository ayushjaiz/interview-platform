interface CaptionDisplayProps {
    caption: string | undefined
  }
  
  export function CaptionDisplay({ caption }: CaptionDisplayProps) {
    return (
      <div className="mt-6 p-4 w-full max-w-lg bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-md min-h-[60px] flex items-center">
        <p className="text-md font-medium">
          {caption && caption.trim() !== "" ? caption : ""}
        </p>
      </div>
    )
  }