import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { GraduationCap, Play, RotateCcw, CheckCircle } from "lucide-react"

interface Question {
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface Quiz {
  questions: Question[]
  id: string
  topic: string
  difficulty: string
}

export default function Learning() {
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const generateQuiz = async () => {
    if (!topic.trim()) return
    
    setIsGenerating(true)
    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), difficulty })
      })
      
      if (response.ok) {
        const quiz = await response.json()
        setCurrentQuiz(quiz)
        setCurrentQuestion(0)
        setSelectedAnswers([])
        setShowResults(false)
        setQuizCompleted(false)
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < (currentQuiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuizCompleted(true)
      setShowResults(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuiz(null)
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setShowResults(false)
    setQuizCompleted(false)
    setTopic("")
  }

  const getScore = () => {
    if (!currentQuiz) return 0
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === currentQuiz.questions[index].correct ? 1 : 0)
    }, 0)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Learning & Training</h1>
          <p className="text-muted-foreground">Test your IT support knowledge with AI-generated quizzes</p>
        </div>
      </div>

      {!currentQuiz ? (
        <Card>
          <CardHeader>
            <CardTitle>Generate a New Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Quiz Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Network Troubleshooting, Windows Server, Security"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  data-testid="input-quiz-topic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger data-testid="select-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={generateQuiz} 
              disabled={!topic.trim() || isGenerating}
              className="w-full"
              data-testid="button-generate-quiz"
            >
              <Play className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating Quiz..." : "Generate Quiz"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {!showResults ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Question {currentQuestion + 1} of {currentQuiz.questions.length}
                  </CardTitle>
                  <Badge variant="outline">
                    {currentQuiz.topic} - {currentQuiz.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {currentQuiz.questions[currentQuestion].question}
                </h2>
                
                <RadioGroup
                  value={selectedAnswers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                >
                  {currentQuiz.questions[currentQuestion].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={resetQuiz}
                    data-testid="button-reset-quiz"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Quiz
                  </Button>
                  <Button 
                    onClick={nextQuestion}
                    disabled={selectedAnswers[currentQuestion] === undefined}
                    data-testid="button-next-question"
                  >
                    {currentQuestion === currentQuiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Quiz Completed!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    Score: {getScore()} / {currentQuiz.questions.length}
                  </h2>
                  <p className="text-muted-foreground">
                    {getScore() === currentQuiz.questions.length 
                      ? "Perfect score! Excellent knowledge!" 
                      : `${Math.round((getScore() / currentQuiz.questions.length) * 100)}% correct`}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review:</h3>
                  {currentQuiz.questions.map((question, index) => (
                    <Card key={index} className="p-4">
                      <h4 className="font-medium mb-2">{question.question}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Your answer: {question.options[selectedAnswers[index]]}
                        {selectedAnswers[index] === question.correct ? (
                          <Badge variant="default" className="ml-2">Correct</Badge>
                        ) : (
                          <Badge variant="destructive" className="ml-2">Incorrect</Badge>
                        )}
                      </p>
                      {selectedAnswers[index] !== question.correct && (
                        <p className="text-sm">
                          <strong>Correct answer:</strong> {question.options[question.correct]}
                        </p>
                      )}
                      <p className="text-sm text-blue-600 mt-2">{question.explanation}</p>
                    </Card>
                  ))}
                </div>

                <Button onClick={resetQuiz} className="w-full" data-testid="button-new-quiz">
                  Generate New Quiz
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}