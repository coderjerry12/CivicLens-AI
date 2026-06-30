import { useNavigate } from 'react-router-dom';
import { useState, Suspense } from 'react';
import {
  ArrowLeft,
  Camera,
  Brain,
  MapPin,
  Sparkles,
  Info,
  CheckCircle2,
  Send,
  Upload,
  RefreshCw,
  XCircle,
  Mic,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
  Badge,
} from '@/components/ui';
import { ImageUpload, type UploadedImage, AIReviewPanel, type ReviewedAnalysis } from '@/components/shared';
import { LocationPicker } from '@/components/location';
import { useImageUpload, useAIAnalysis, useIssueSubmission } from '@/hooks';
import { useVoiceReport } from '@/hooks/useVoiceReport';
import { detectDuplicates, type PotentialDuplicate } from '@/services/duplicateDetectionService';
import { cn } from '@/lib/utils';
import type { SelectedLocation } from '@/types/location';

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [reviewedData, setReviewedData] = useState<ReviewedAnalysis | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const { uploadState, startUpload, retry, reset } = useImageUpload();
  const { analysisState, analyze, retry: retryAnalysis, reset: resetAnalysis } = useAIAnalysis();
  const { submissionState, submit, reset: resetSubmission } = useIssueSubmission();
  const voice = useVoiceReport();
  const [duplicates, setDuplicates] = useState<PotentialDuplicate[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  const handleImageChange = (image: UploadedImage | null) => {
    setUploadedImage(image);
    if (!image) {
      reset();
      resetAnalysis();
      setReviewedData(null);
      setSelectedLocation(null);
    }
  };

  const handleUploadToStorage = () => {
    if (uploadedImage?.file) {
      startUpload(uploadedImage.file);
    }
  };

  const handleRunAnalysis = () => {
    if (uploadState.dataURL) {
      analyze(uploadState.dataURL);
    }
  };

  const isUploaded = uploadState.state === 'success';
  const isUploading = uploadState.state === 'uploading';
  const hasUploadError = uploadState.state === 'error';
  const isAnalyzing = analysisState.status === 'analyzing';
  const analysisComplete = analysisState.status === 'success';
  const hasAnalysisError = analysisState.status === 'error';
  const isReadyToSubmit = !!reviewedData && !!selectedLocation && isUploaded;
  const isSubmitting = submissionState.status === 'submitting';
  const isSubmitted = submissionState.status === 'success';

  const handleSubmit = async () => {
    if (!reviewedData || !selectedLocation || !uploadState.dataURL) return;

    // Check for duplicates first
    setCheckingDuplicates(true);
    try {
      const dups = await detectDuplicates(
        reviewedData.category,
        reviewedData.title,
        selectedLocation.latitude,
        selectedLocation.longitude
      );
      setDuplicates(dups);
      if (dups.length > 0) {
        setCheckingDuplicates(false);
        return; // Show duplicate warning — user can still submit via "Continue Anyway"
      }
    } catch { /* continue with submission */ }
    setCheckingDuplicates(false);

    performSubmit();
  };

  const performSubmit = () => {
    if (!reviewedData || !selectedLocation || !uploadState.dataURL) return;

    submit({
      title: reviewedData.title,
      description: reviewedData.description,
      category: reviewedData.category,
      severity: reviewedData.severity,
      department: reviewedData.department,
      imageDataURL: uploadState.dataURL,
      location: {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: selectedLocation.address,
        source: selectedLocation.source,
      },
      aiConfidence: reviewedData.confidence,
      wasEdited: true,
    });
    setDuplicates([]);
  };

  const handleReportAnother = () => {
    setUploadedImage(null);
    setReviewedData(null);
    setSelectedLocation(null);
    reset();
    resetAnalysis();
    resetSubmission();
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Success Screen */}
      {isSubmitted && submissionState.result && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center animate-scale-in">
            {/* Confetti-style decorative elements */}
            <div className="relative">
              <div className="absolute -top-4 left-1/4 w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="absolute -top-2 right-1/3 w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
              <div className="absolute top-0 left-1/3 w-1 h-1 rounded-full bg-secondary-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -top-3 right-1/4 w-2.5 h-2.5 rounded-full bg-success-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 rounded-full bg-danger-300 animate-bounce" style={{ animationDelay: '0.4s' }} />

              <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-success-100 dark:bg-success-500/20 mb-6 animate-fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-200 dark:bg-success-500/30">
                  <CheckCircle2 className="h-10 w-10 text-success-600 dark:text-success-400" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-2">
              Issue Submitted Successfully
            </h2>
            <p className="text-sm text-text-secondary dark:text-neutral-400 mb-6">
              Thank you for helping improve your community. Authorities will review your report soon.
            </p>

            {/* Tracking ID Card */}
            <div className="rounded-[14px] border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-4 mb-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Tracking ID</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-text-primary dark:text-white font-mono">
                  {submissionState.result.trackingId}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(submissionState.result!.trackingId);
                  }}
                  className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  aria-label="Copy tracking ID"
                  title="Copy to clipboard"
                >
                  <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Estimated time */}
            <div className="rounded-[14px] border border-primary-200 dark:border-primary-500/20 bg-primary-50 dark:bg-primary-500/5 p-3 mb-6">
              <p className="text-xs text-primary-700 dark:text-primary-300 font-medium">
                ⏱️ Estimated Review Time: 24–48 Hours
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/app/dashboard')}>
                Dashboard
              </Button>
              <Button className="flex-1" onClick={handleReportAnother}>
                Report Another Issue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form (hidden when submitted) */}
      {!isSubmitted && (
      <>
      {/* Page Content */}
      <div className="flex-1 p-4 lg:p-6 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-primary-100 dark:bg-primary-500/20">
              <Sparkles className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Report Community Issue
              </h1>
              <p className="text-sm text-text-secondary dark:text-neutral-400 mt-1">
                Upload a photo and our AI will automatically identify, categorize, and prioritize the issue for faster resolution.
              </p>
              {/* Voice Report Button */}
              {voice.supported && (
                <div className="mt-3">
                  <Button
                    variant={voice.recording ? 'danger' : 'outline'}
                    size="sm"
                    onClick={voice.startRecording}
                    disabled={voice.recording || voice.processing}
                    isLoading={voice.processing}
                  >
                    {voice.recording ? (
                      <><Mic className="h-4 w-4 animate-pulse" /> Listening...</>
                    ) : (
                      <><Mic className="h-4 w-4" /> Report with Voice</>
                    )}
                  </Button>
                  {voice.transcript && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                      Heard: "{voice.transcript}"
                    </p>
                  )}
                  {voice.error && (
                    <p className="text-xs text-danger-600 dark:text-danger-400 mt-1.5">{voice.error}</p>
                  )}
                  {voice.result && (
                    <div className="mt-2 rounded-[10px] bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 px-3 py-2">
                      <p className="text-xs font-medium text-success-800 dark:text-success-300">✓ Voice processed: {voice.result.title}</p>
                      <p className="text-[10px] text-success-600 dark:text-success-400">{voice.result.category} • {voice.result.severity}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl">
            <ProgressStep number={1} label="Upload" active={!isUploaded} done={isUploaded} />
            <ProgressConnector done={isUploaded} />
            <ProgressStep number={2} label="AI Analysis" active={isUploaded && !analysisComplete} done={analysisComplete} />
            <ProgressConnector done={analysisComplete} />
            <ProgressStep number={3} label="Location" active={!!reviewedData && !selectedLocation} done={!!selectedLocation} />
            <ProgressConnector done={!!selectedLocation} />
            <ProgressStep number={4} label="Submit" active={!!selectedLocation} />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Card */}
            <Card className="overflow-hidden">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                Upload Image
                {isUploaded && (
                  <Badge variant="success" size="sm" className="ml-auto">✓ Uploaded</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Capture or upload a clear photo of the infrastructure issue.
              </CardDescription>
              <CardContent className="mt-4">
                <ImageUpload value={uploadedImage} onChange={handleImageChange} />

                {/* Upload to Storage Button */}
                {uploadedImage && !isUploaded && (
                  <div className="mt-4 space-y-3">
                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                            Uploading...
                          </p>
                          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                            {uploadState.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-600 transition-all duration-300 ease-out"
                            style={{ width: `${uploadState.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {hasUploadError && (
                      <div className="flex items-start gap-2 rounded-[10px] bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 px-3 py-2.5" role="alert">
                        <XCircle className="h-4 w-4 text-danger-600 dark:text-danger-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-danger-700 dark:text-danger-300">{uploadState.error}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={retry} className="shrink-0">
                          <RefreshCw className="h-3.5 w-3.5" />
                          Retry
                        </Button>
                      </div>
                    )}

                    {/* Upload Button */}
                    {!isUploading && !hasUploadError && (
                      <Button
                        className="w-full"
                        onClick={handleUploadToStorage}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Button>
                    )}
                  </div>
                )}

                {/* Success State */}
                {isUploaded && (
                  <div className="mt-4 flex items-center gap-3 rounded-[10px] bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-success-800 dark:text-success-300">
                        Image uploaded successfully
                      </p>
                      <p className="text-xs text-success-600 dark:text-success-400">
                        Ready for AI analysis
                      </p>
                    </div>
                  </div>
                )}

                {/* Tip */}
                {!uploadedImage && (
                  <div className="mt-4 flex items-start gap-2 rounded-[10px] bg-neutral-100 dark:bg-neutral-800 px-3 py-2.5">
                    <Info className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      For best AI results: capture the full issue clearly, include surrounding context, and ensure good lighting.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis Card — only show after image is uploaded */}
            {isUploaded && (
            <Card className={cn(
              'relative overflow-hidden',
              !isUploaded && 'border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/20'
            )}>
              <div className="absolute top-4 right-4">
                {analysisComplete && <Badge variant="success" size="sm">✓ Complete</Badge>}
                {isAnalyzing && <Badge variant="primary" size="sm">Analyzing...</Badge>}
                {!isUploaded && !isAnalyzing && !analysisComplete && <Badge variant="neutral" size="sm">Waiting for image</Badge>}
              </div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                AI Analysis
              </CardTitle>
              <CardDescription>
                {isUploaded && !analysisComplete
                  ? 'Image ready. Run AI analysis to categorize the issue.'
                  : 'Upload an image to let CivicLens AI automatically identify the issue.'}
              </CardDescription>
              <CardContent className="mt-4">
                {/* Idle state — waiting for upload */}
                {!isUploaded && !isAnalyzing && !analysisComplete && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-500/10 mb-4">
                      <Brain className="h-7 w-7 text-secondary-500 dark:text-secondary-400 opacity-60" />
                    </div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                      AI analysis will appear here
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
                      Our AI will categorize the issue, estimate severity, and generate a description based on your photo.
                    </p>
                  </div>
                )}

                {/* Ready to analyze */}
                {isUploaded && !isAnalyzing && !analysisComplete && !hasAnalysisError && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20 mb-4">
                      <Sparkles className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                      Image uploaded and ready
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                      Click below to let AI analyze the issue
                    </p>
                    <Button onClick={handleRunAnalysis}>
                      <Brain className="h-4 w-4" />
                      Run AI Analysis
                    </Button>
                  </div>
                )}

                {/* Analyzing — staged progress */}
                {isAnalyzing && (
                  <div className="py-4 space-y-3">
                    <AnalysisStageItem
                      label="Detecting issue type"
                      active={analysisState.stage === 'detecting_type'}
                      done={['estimating_severity', 'identifying_department', 'generating_summary', 'complete'].includes(analysisState.stage)}
                    />
                    <AnalysisStageItem
                      label="Estimating severity"
                      active={analysisState.stage === 'estimating_severity'}
                      done={['identifying_department', 'generating_summary', 'complete'].includes(analysisState.stage)}
                    />
                    <AnalysisStageItem
                      label="Identifying responsible department"
                      active={analysisState.stage === 'identifying_department'}
                      done={['generating_summary', 'complete'].includes(analysisState.stage)}
                    />
                    <AnalysisStageItem
                      label="Generating report summary"
                      active={analysisState.stage === 'generating_summary'}
                      done={analysisState.stage === 'complete'}
                    />
                  </div>
                )}

                {/* Success */}
                {analysisComplete && analysisState.result && (
                  <div className="py-2">
                    <div className="flex items-center gap-2 rounded-[10px] bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 px-4 py-3 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-success-800 dark:text-success-300">
                          Analysis complete
                        </p>
                        <p className="text-xs text-success-600 dark:text-success-400">
                          Confidence: {analysisState.result.confidence}%
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-[10px] bg-neutral-50 dark:bg-neutral-800 p-3">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Category</p>
                        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-1 capitalize">
                          {analysisState.result.category.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="rounded-[10px] bg-neutral-50 dark:bg-neutral-800 p-3">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Severity</p>
                        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-1 capitalize">
                          {analysisState.result.severity}
                        </p>
                      </div>
                      <div className="rounded-[10px] bg-neutral-50 dark:bg-neutral-800 p-3">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Dept</p>
                        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-1 capitalize">
                          {analysisState.result.department.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {hasAnalysisError && (
                  <div className="flex flex-col items-center py-4 text-center">
                    <div className="flex items-start gap-2 w-full rounded-[10px] bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 px-3 py-2.5 mb-4" role="alert">
                      <XCircle className="h-4 w-4 text-danger-600 dark:text-danger-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-danger-700 dark:text-danger-300">{analysisState.error}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={retryAnalysis}>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retry Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {/* Report Details — AI Review Panel (only show after analysis) */}
            {analysisComplete && analysisState.result && (
              <AIReviewPanel
                result={analysisState.result}
                onChange={setReviewedData}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-neutral-900 dark:bg-neutral-900 border-neutral-800 dark:border-neutral-700">
              <CardTitle className="text-sm text-white">Report Summary</CardTitle>
              <CardContent className="mt-3">
                <div className="space-y-3">
                  <SummaryRow label="Image" value={isUploaded ? '✓ Stored' : uploadedImage ? 'Selected' : 'Not uploaded'} done={isUploaded} />
                  <SummaryRow label="AI Analysis" value={analysisComplete ? '✓ Complete' : isAnalyzing ? 'Analyzing...' : 'Pending'} done={analysisComplete} />
                  <SummaryRow label="Review" value={reviewedData ? '✓ Reviewed' : 'Pending'} done={!!reviewedData} />
                  <SummaryRow label="Location" value={selectedLocation ? '✓ Selected' : 'Pending'} done={!!selectedLocation} />
                  <SummaryRow label="Status" value={reviewedData ? 'Ready to submit' : analysisComplete ? 'Review fields' : isUploaded ? 'Run AI analysis' : 'Upload image'} done={!!reviewedData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location Card — Full Width, only after review */}
        {reviewedData && (
        <div className="mt-6">
          <Card>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-danger-600 dark:text-danger-400" />
              Location
            </CardTitle>
            <CardContent className="mt-4">
              <Suspense fallback={<div className="h-52 rounded-[14px] bg-neutral-100 dark:bg-neutral-800 animate-pulse" />}>
                <LocationPicker
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        )}
      </div>

      {/* Duplicate Warning */}
      {duplicates.length > 0 && (
        <div className="mx-4 lg:mx-6 mb-2 rounded-[14px] border border-accent-300 dark:border-accent-500/30 bg-accent-50 dark:bg-accent-500/5 p-4 animate-slide-up">
          <p className="text-sm font-semibold text-accent-800 dark:text-accent-300 mb-2">
            ⚠️ Similar issues found nearby
          </p>
          <div className="space-y-2 mb-3">
            {duplicates.slice(0, 3).map((dup) => (
              <div key={dup.documentId} className="flex items-center justify-between rounded-[10px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{dup.title}</p>
                  <p className="text-[10px] text-neutral-500">{dup.distance}km away • {dup.similarityScore}% match • {dup.status}</p>
                </div>
                <Badge variant={dup.similarityScore > 70 ? 'danger' : 'accent'} size="sm">{dup.similarityScore}%</Badge>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDuplicates([])}>
              View Existing Issues
            </Button>
            <Button size="sm" onClick={performSubmit}>
              Continue with New Report
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Submit Footer */}
      <div className="sticky bottom-0 z-20 border-t border-border dark:border-white/10 bg-surface/90 dark:bg-neutral-900/90 backdrop-blur-lg px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {submissionState.errors.length > 0 ? (
            <p className="text-xs text-danger-600 dark:text-danger-400">
              {submissionState.errors[0].message}
            </p>
          ) : submissionState.submitError ? (
            <p className="text-xs text-danger-600 dark:text-danger-400">
              {submissionState.submitError}
            </p>
          ) : (
            <p className="text-xs text-text-muted dark:text-neutral-500">
              {isReadyToSubmit ? 'All steps complete. Ready to submit.' : 'Complete all steps to submit.'}
            </p>
          )}
          <Button
            disabled={!isReadyToSubmit || isSubmitting || checkingDuplicates}
            isLoading={isSubmitting || checkingDuplicates}
            onClick={handleSubmit}
            className="px-6"
          >
            <Send className="h-4 w-4" />
            {checkingDuplicates ? 'Checking...' : 'Submit Report'}
          </Button>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

// ─── Sub-components ───

function ProgressStep({ number, label, active = false, done = false }: { number: number; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
          done
            ? 'bg-success-600 text-white shadow-md shadow-success-600/30'
            : active
              ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
        )}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : number}
      </div>
      <span className={cn(
        'text-[11px] font-medium',
        done ? 'text-success-600 dark:text-success-400' :
        active ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500'
      )}>
        {label}
      </span>
    </div>
  );
}

function ProgressConnector({ done = false }: { done?: boolean }) {
  return (
    <div className={cn(
      'flex-1 h-0.5 mx-2 mt-[-18px] rounded-full transition-colors duration-500',
      done ? 'bg-success-400' : 'bg-neutral-200 dark:bg-neutral-700'
    )} />
  );
}

function SummaryRow({ label, value, done = false }: { label: string; value: string; done?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className={cn(
        'text-xs font-medium',
        done ? 'text-success-400' : 'text-neutral-300'
      )}>{value}</span>
    </div>
  );
}

function AnalysisStageItem({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300',
        done && 'bg-success-100 dark:bg-success-500/20',
        active && 'bg-primary-100 dark:bg-primary-500/20',
        !done && !active && 'bg-neutral-100 dark:bg-neutral-800'
      )}>
        {done ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-success-600 dark:text-success-400" />
        ) : active ? (
          <div className="h-2.5 w-2.5 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        )}
      </div>
      <span className={cn(
        'text-sm transition-colors',
        done && 'text-success-700 dark:text-success-400 font-medium',
        active && 'text-primary-700 dark:text-primary-300 font-medium',
        !done && !active && 'text-neutral-400 dark:text-neutral-500'
      )}>
        {label}
      </span>
    </div>
  );
}
