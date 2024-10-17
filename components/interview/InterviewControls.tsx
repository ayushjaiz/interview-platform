import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface InterviewControlsProps {
  interviewState: boolean
  startInterview: () => void
  endInterview: () => void
}

export function InterviewControls({
  interviewState,
  startInterview,
  endInterview,
}: InterviewControlsProps) {

  return (
    <Card className="w-full max-w-lg bg-white shadow-lg rounded-lg">
      <CardHeader className="p-6">
        <CardTitle className="text-3xl font-bold text-center text-gray-800">
          ML Technical Interview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!interviewState ? (
          <div className="flex">
            <Button
              onClick={startInterview}
              className="mx-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out"
            >
              Start Interview
            </Button>
          </div>
        ) : (
          <div className="flex">

            <Button
              onClick={endInterview}
              className="mx-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out"
            >
              End Interview
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}