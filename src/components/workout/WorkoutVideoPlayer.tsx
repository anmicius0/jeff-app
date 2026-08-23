import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ExternalLink, Video } from 'lucide-react';
import { getExerciseVideoEmbedUrl, EXERCISE_VIDEO_MAP } from '../../data/exerciseVideos';

interface WorkoutVideoPlayerProps {
  exerciseName: string;
  defaultExpanded?: boolean;
}

export const WorkoutVideoPlayer: React.FC<WorkoutVideoPlayerProps> = ({
  exerciseName,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const embedUrl = getExerciseVideoEmbedUrl(exerciseName);
  const videoId = EXERCISE_VIDEO_MAP[exerciseName];

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [exerciseName, defaultExpanded]);

  if (!embedUrl) return null;

  const directYoutubeUrl = videoId
    ? `https://youtu.be/${videoId}`
    : `https://www.youtube.com/results?search_query=Jeff+Nippard+${encodeURIComponent(exerciseName)}`;

  return (
    <div className="rounded-lg bg-surface-2 border border-hairline overflow-hidden shadow-md transition-all duration-200">
      {/* Header / Toggle Bar */}
      <div className="px-3 py-2 sm:px-3.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-medium text-ink hover:text-primary-hover transition cursor-pointer"
        >
          <div className="w-5 h-5 rounded bg-surface-3 border border-hairline flex items-center justify-center text-primary-hover">
            <Video className="w-3 h-3" />
          </div>
          <span className="font-semibold text-xs">Video Demonstration</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-3 border border-hairline text-ink-subtle">
            Jeff Nippard
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          <a
            href={directYoutubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded bg-surface-3 hover:bg-surface-4 border border-hairline text-ink-subtle hover:text-ink transition"
            title="Open in YouTube"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-0.5 rounded bg-surface-3 hover:bg-surface-4 border border-hairline text-[11px] font-mono text-ink-muted hover:text-ink transition flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <EyeOff className="w-3 h-3" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-primary-hover" />
                <span>Show</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded YouTube Iframe on top card (Responsive 16:9 Aspect Ratio) */}
      {isExpanded && (
        <div className="border-t border-hairline bg-canvas p-2 animate-in fade-in duration-200">
          <div className="relative w-full aspect-video rounded-md overflow-hidden bg-surface-3 border border-hairline-strong shadow-inner">
            <iframe
              src={embedUrl}
              key={embedUrl}
              title={`${exerciseName} Exercise Demonstration`}
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};
