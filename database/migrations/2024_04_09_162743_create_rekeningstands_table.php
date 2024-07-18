<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rekeningstands', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('rekening_id');
            $table->string('datum',10)->default('0000-00-00');
            $table->decimal('stand',$precision=10, $scale=2)->default(0.00);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekeningstands');
    }
};
