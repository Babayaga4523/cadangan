<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Attempt;
use Illuminate\Support\Facades\Config;

class ShareAttemptResult extends Mailable
{
    use Queueable, SerializesModels;

    public $attempt;
    public $score;
    public $total;
    public $correct;
    public $school;
    public $class;

    /**
     * Create a new message instance.
     */
    public function __construct(Attempt $attempt, $score, $total, $correct, $school = null, $class = null)
    {
        $this->attempt = $attempt;
        $this->score = $score;
        $this->total = $total;
        $this->correct = $correct;
        $this->school = $school;
        $this->class = $class;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $title = $this->attempt->test->title ?? 'Hasil Ujian';
        // set from address from config if present
        $from = Config::get('mail.from.address');
        $fromName = Config::get('mail.from.name');

        $m = $this->subject("Hasil Ujian: {$title}")
                  ->view('emails.share_attempt')
                  ->with([
                      'attempt' => $this->attempt,
                      'score' => $this->score,
                      'total' => $this->total,
                      'correct' => $this->correct,
                      'school' => $this->school,
                      'class' => $this->class,
                  ])
                  ->text('emails.share_attempt_text');

        if ($from) {
            $m->from($from, $fromName ?? null);
        }

        return $m;
    }
}
