<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CBTTest extends Model
{
    use HasFactory;

    protected $table = 'tests';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'description',
        'duration_minutes',
        'subject_id',
        'start_date',
        'end_date',
        'is_active',
        'randomize_questions',
        'show_results_immediately',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'randomize_questions' => 'boolean',
        'show_results_immediately' => 'boolean',
    ];

    public function questions()
    {
        return $this->hasMany(Question::class, 'test_id');
    }

    public function attempts()
    {
        return $this->hasMany(Attempt::class, 'test_id');
    }
}
